import datetime
import logging

from api.models import LocationIndicator

from django.conf import settings
from django.contrib.auth import authenticate
from django.db import transaction

from reporting.models import Collection, Unit
from reporting.serializers import UnitSerializer
from reporting.utils.utils import get_users_location_indicator, get_users_units
from reporting.viewsets.app_base_viewset import BaseViewSet

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from user_management.authentication import Authentication
from user_management.constants import UserGroup
from user_management.models import NexusUser
from user_management.serializers import NexusUserContextSerializer
from user_management.utils.ldap_helper import is_user_inactive
from user_management.utils.utils import (get_tokens_for_user, get_user_app_role, get_user_role,
                                         is_user_a_catco, is_user_a_controller, is_user_a_hub_manager, is_user_a_supervisor, is_user_a_viewer)

logger = logging.getLogger(__name__)


class AuthenticationViewSet(BaseViewSet):
    """Handles authentication: login, logout, refresh, user details."""
    permission_classes = [IsAuthenticated]
    authentication_classes = [Authentication]

    def _set_token_cookies(self, response, access_token, refresh_token):

        def max_age_from_lifetime(lifetime):
            return int(lifetime.total_seconds())

        access_token_lifetime = settings.SIMPLE_JWT.get(
            "ACCESS_TOKEN_LIFETIME", datetime.timedelta(minutes=5)
            )
        refresh_token_lifetime = settings.SIMPLE_JWT.get(
            "REFRESH_TOKEN_LIFETIME", datetime.timedelta(days=1)
            )
        response.set_cookie(
            key='access_token',
            value=str(access_token),
            max_age=max_age_from_lifetime(access_token_lifetime),
            httponly=True,
            secure=False,
            samesite='Strict'
            )

        if refresh_token:  # in the case of access token refresh
            response.set_cookie(
                key='refresh_token',
                value=str(refresh_token),
                max_age=max_age_from_lifetime(refresh_token_lifetime),
                httponly=True,
                secure=False,
                samesite='Strict',
                # Set the path to only be used for auth URLs
                path='/api/auth/'
                )
            response.set_cookie(
                key='refresh_token_ws',
                value=str(refresh_token),
                max_age=max_age_from_lifetime(refresh_token_lifetime),
                httponly=True,
                secure=False,
                samesite='Strict',
                path='/ws/api/'
                )

    def _clear_token_cookies(self, response):
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token', path='/api/auth/')
        response.delete_cookie('refresh_token_ws', path='/ws/api/')


    def get_tokens_for_user(user, role):
        logger.info(f"Generating tokens for user: {user.username}")
        refresh = RefreshToken.for_user(user)
        refresh['username'] = user.username
        refresh['full_name'] = user.get_full_name()
        refresh['role'] = role
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            }


    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def login(self, request):  # noqa
        with transaction.atomic():
            data = request.data
            username = data.get("username", None)
            password = data.get("password", None)

            user = authenticate(username=username, password=password)
            if not user:
                if is_user_inactive(username):
                    logger.info(
                        f"Inactive user {username} attempted to login.")
                    return Response(
                        "User account is inactive", status=status.HTTP_403_FORBIDDEN)
                else:
                    logger.info(
                        f"LDAP Authentication error for user :{username}:")

                    raise AuthenticationFailed(
                        "Authentication failed,  Invalid username or password")

            # role = get_user_role(user)


            tokens = get_tokens_for_user(user, "RESPONDANT")

            response = Response({"message": "Login successful"})
            # Set cookies
            self._set_token_cookies(
                response, tokens['access'], tokens['refresh'])


            logger.info(f"User {username} logged in successfully.")

            return response

    @action(detail=False, methods=["post"])
    def logout(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except (InvalidToken, TokenError):
            pass  # Ignore if invalid

        response = Response({"message": "Logout successful"})
        self._clear_token_cookies(response)
        return response

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def refresh_token(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            raise AuthenticationFailed("Refresh token missing")

        try:
            refresh = RefreshToken(refresh_token)
            new_access = str(refresh.access_token)

            rotate_refresh = settings.SIMPLE_JWT.get(
                'ROTATING_REFRESH_TOKENS', False)
            new_refresh = None
            if rotate_refresh:
                # we might want to rotate refresh token as well but if enable d this will become handy
                new_refresh = str(refresh)
                refresh.blacklist()

        except (InvalidToken, TokenError) as error:
            logger.error(
                f"CRITICAL: Invalid refresh token in refresh_token: {error} full traceback:", exc_info=True)
            raise AuthenticationFailed(
                f"Invalid refresh token with {str(error)}")

        response = Response({"message": "Token refreshed"})
        self._set_token_cookies(response, new_access, new_refresh)
        return response

    @action(detail=False, methods=["post"])
    def get_user_detail(self, request):
        try:
            user: NexusUser = request.user
            if not user.is_authenticated:
                raise AuthenticationFailed("Not authenticated")

            role = get_user_role(user)
            units = []

            if is_user_a_controller(user) or is_user_a_supervisor(user) or is_user_a_catco(user) or is_user_a_viewer(user) or is_user_a_hub_manager(user):
                user_units = user.get_units()
                units = UnitSerializer(
                    user_units, many=True).data

            serialized_data = NexusUserContextSerializer(
                context={
                    'user': user,
                    'role': role,
                    'app_role': get_user_app_role(role),
                    'units': units,
                    'location_indicator': user.location_indicator,
                    }
                ).to_representation()
            return Response(serialized_data)
        except Exception as error:
            logger.error(
                f"CRITICAL: unknown Error in get_user_detail: {error}")

            raise AuthenticationFailed("Error retrieving user details")

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def clear_session(self, request):
        response = Response({"message": "Session cleared"})

        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except (InvalidToken, TokenError):
                pass  # Ignore invalid

        # remove cookies
        self._clear_token_cookies(response)

        return response
