import json
import math

from django.db import transaction
from django.db.models import Count
from django.http import QueryDict
from django.utils import timezone

from datetime import timedelta

# Avoid doing this if possible
from django.contrib.auth import get_user_model

from .models import QuestionGroup, Question2, ImpactReport, Photo, Answer, Location
from .serializers import ImpactReportSerializer
from .serializers import InfrastructureLocationSerializer
from .serializers import UserSerializer, UserAdminSerializer
from .serializers import QuestionSerializer
from .serializers import AnswerMinimalSerializer
from .serializers import AnswerSerializer
from .serializers import QuestionGroupSerializer

from .utils import generate_pseudonym, extract_exif_metadata, polygon_centroid
from .utils import send_invitation_email


from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()


from .constants import ElectrictyDamageLevel, HealthServicesRatingLevel

class ImpactReportViewSet(viewsets.ModelViewSet):
    queryset = ImpactReport.objects.all()
    serializer_class = ImpactReportSerializer
    lookup_value_regex = r'\d+'



    def create(self, request, *args, **kwargs):

        infrastructure_location_serializer = InfrastructureLocationSerializer(data=request.data)
        infrastructure_location_serializer.is_valid(raise_exception=True)
        infrastructure_location = infrastructure_location_serializer.save()

        photos = request.FILES.getlist('photos')

        # Fix: Fallback to string '[]' instead of a list [] object
        photo_description_raw = request.data.get('photoDescription', '[]')
        photoDescriptions = json.loads(photo_description_raw)

        photo_ids = []

        try:
            # Use an atomic block so multiple saves don't cause partial failures
            with transaction.atomic():
                for index, photo in enumerate(photos):
                    p = Photo(image=photo)

                    # Safely assign description if it exists
                    if 0 <= index < len(photoDescriptions):
                        p.description = photoDescriptions[index]

                    if photo:
                        exif_data, captured_at = extract_exif_metadata(photo)
                        
                        print('EXIF DATA: ', exif_data)
                        p.exif_data = exif_data
                        photo.seek(0)

                    # 4. Save the instance
                    p.save()
                    
                    # Populate your photo_ids list
                    photo_ids.append(p.id)
        except Exception as e:
            print(e)

        annotations_raw = request.data.get('annotations', None)

        data = QueryDict(mutable=True)
        for key, values in request.data.lists():
            if key not in ('photos', 'annotations'):
                data.setlist(key, values)
        
        data['location_id'] = infrastructure_location.id
        data.setlist('photos_id', photo_ids)
        
        if request.user.pk:
            data['reported_by_pk'] = request.user.pk
        else:
            data['anonymous_reported_by'] = generate_pseudonym()
        
        ser = ImpactReportSerializer(data=data)
        ser.is_valid(raise_exception=True)
        report: ImpactReport = ser.save()
        
        
        # report.annotations is null here and this block never executes.
        # annotations = report.annotations or {}
        # incident_point = annotations.get("incident_point") or {}
        # geometry = incident_point.get("geometry") or {}
        # coords = geometry.get("coordinates")
        # if coords and isinstance(coords, list) and len(coords) == 2:
        #     geometry["coordinates"] = [coords[1], coords[0]]
        #     report.annotations = annotations
        #     report.save(update_fields=['annotations'])


        if annotations_raw:
            try:
                ser.instance.annotations = json.loads(annotations_raw)
                ser.instance.save(update_fields=['annotations'])
            except (json.JSONDecodeError, TypeError):
                pass

        # Extract reference point from annotations.
        # incident_point coords are stored as [lat, lng] (frontend swaps before submit).
        # incident_polygon ring coords are stored as [lng, lat] (GeoJSON standard, no swap).
        # Point takes priority over polygon.
        saved_annotations = report.annotations or {}
        ref_lat = None
        ref_lon = None

        ip = saved_annotations.get('incident_point') or {}
        ip_coords = (ip.get('geometry') or {}).get('coordinates')
        if ip_coords and isinstance(ip_coords, list) and len(ip_coords) == 2:
            ref_lat = ip_coords[0]
            ref_lon = ip_coords[1]
        else:
            poly = saved_annotations.get('incident_polygon') or {}
            ring = ((poly.get('geometry') or {}).get('coordinates') or [[]])[0]
            if isinstance(ring, list) and len(ring) >= 3:
                centroid_lng, centroid_lat = polygon_centroid(ring)
                ref_lat = centroid_lat
                ref_lon = centroid_lng

        if ref_lat is not None and ref_lon is not None:
            report.impact_reference_point_lat = ref_lat
            report.impact_reference_point_lon = ref_lon

        # get_report_quality_score(report)
        score = 0
        score += (report.photos.count() * 3)  # 3 points for each photo
        score += len([p for p in report.photos.all() if p.description is not None]) # 3 points for each captioned photo
        score += (5 if report.infrastructure_name else 0)
        score += (5 if report.infrastructure_name else 0)
        score += (5 if report.description else 0)
       
        score += (2 if report.damage_datetime else 0)
        
        score +=(1 if report.electricity_condition is not ElectrictyDamageLevel.UNKNOWN else 0)
        score +=(1 if report.health_services_rating is not HealthServicesRatingLevel.UNKNOWN else 0)
        
        
        # send survey invitation mail for users in the surrounding of the impact
        users_to_receive_survey_email = []
        for user in User.objects.all():
            try:
                if user.email:
                    
                        
                    if not user.location.latitude or not user.location.longitude:
                        continue
                                
                    if report.impact_reference_point_lat is not None and report.impact_reference_point_lon is not None:
                        report_lat = report.impact_reference_point_lat
                        report_lng = report.impact_reference_point_lon
                    elif (report.location and
                          report.location.infrastructure_latitude is not None and
                          report.location.infrastructure_longitude is not None):
                        report_lat = report.location.infrastructure_latitude
                        report_lng = report.location.infrastructure_longitude
                    else:
                        continue

                    distance_threshold_in_km = 100  # KM
                    
                        
                    # Convert degrees to radians
                    lat1, lon1 = math.radians(user.location.latitude), math.radians(user.location.longitude)
                    lat2, lon2 = math.radians(report_lat), math.radians(report_lng)
                    
                    dlat = lat2 - lat1
                    dlon = lon2 - lon1
                    
                    # Haversine formula
                    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
                    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                    distance = 6371 * c 

                    # Check if user is within the specific question's allowed threshold
                    if distance <= distance_threshold_in_km:
                        users_to_receive_survey_email.append(user)
            except:
                continue

        if len(users_to_receive_survey_email) > 0:                
            for u in users_to_receive_survey_email:      
                send_invitation_email(u.email ,'report')

        
        
        report.quality_score = score
        report.save()
        
        
        
        return Response(ser.data, status=status.HTTP_201_CREATED)


    @action(detail=False, methods=["GET"], url_name= "get_unmapped_imapct_reports")
    def get_unmapped_imapct_reports(self, request,):
        """
        Returns all reports that are unmapped
        """
        queryset = ImpactReport.objects.filter()
        serializer = ImpactReportSerializer(queryset, many=True)
        return Response(serializer.data)



    @action(detail=False, methods=["GET"], url_name="get_user_reports")
    def get_user_reports(self, request):
        """
        Returns all reports created by the currently authenticated user.
        """
        queryset = ImpactReport.objects.filter(reported_by__pk=request.user.pk)
        serializer = ImpactReportSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["GET"], url_name="get_reports_by_user_id")
    def get_reports_by_user_id(self, request):
        """
        Admin: returns all reports for a given user_id query param.
        """
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {"error": "user_id query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        queryset = ImpactReport.objects.filter(reported_by__pk=user_id)
        serializer = ImpactReportSerializer(queryset, many=True)
        return Response(serializer.data)


    @action(detail=False, methods=["POST"], url_name= "get_reports_by_stored_ids")
    def get_reports_by_stored_ids(self, request):
        report_ids = request.data.get('report_ids', [])

        user_id = request.user.pk
        

        queryset = ImpactReport.objects.filter(pk__in=report_ids, reported_by__pk=user_id)
        serializer = ImpactReportSerializer(queryset, many=True)
        return Response(serializer.data)
        
        
    @action(detail=False, methods=["GET"], url_name= "get_report_stats")
    def get_report_stats(self, request):
        stats_dict = {}
        range_in_days = request.query_params.get('range', 2)

        start_date = timezone.now() - timedelta(days=int(range_in_days))

        queryset = ImpactReport.objects.filter(created_at__gte=start_date)
        
        
        # 1. Group by the severity field and count the rows
        severity_stats = (
                queryset
                .values('damage_severity')
                .annotate(total=Count('id'))
                .order_by()  # Clears any default ordering that might break GROUP BY
        )

        severity_dict = {item['damage_severity']: item['total'] for item in severity_stats}

        infra_type_stats = (
                queryset
                .values('infrastructure_type')
                .annotate(total=Count('id'))
                .order_by()  # Clears any default ordering that might break GROUP BY
        )

        infra_type_dict = {item['infrastructure_type']: item['total'] for item in infra_type_stats}


        stats_dict['damage_severity'] = severity_dict
        stats_dict['infrastructure_type'] = infra_type_dict
        stats_dict['total_reports'] = queryset.count()

        return Response(stats_dict)



    @action(detail=False, methods=["POST"], url_name= "attach_questions_to_report")
    def attach_questions_to_report(self, request):
        with transaction.atomic():
            data = request.data.copy()

            start_time = timezone.now()

            duration_days = int(request.data.get('duration', 2))
            end_time = start_time + timedelta(days=duration_days)

            data['start_time'] = start_time.isoformat().replace('+00:00', 'Z')
            data['end_time'] = end_time.isoformat().replace('+00:00', 'Z')

            qg_serializer = QuestionGroupSerializer(data=data)
            qg_serializer.is_valid(raise_exception=True)
            question_group = qg_serializer.save()

            questions_list = request.data.get('questions', []) 
            for question in questions_list:
                question['question_group_id'] = question_group.pk

            s = QuestionSerializer(data=questions_list, many=True)
            s.is_valid(raise_exception=True)
            s.save()
            
            
            # send survey invitation mai;l for users in the surrounding of the impact
            users_to_receive_survey_email = []
            for user in User.objects.all():
                print(user, user.email)
                if user.email:
                    
                    if not user.location.latitude or not user.location.longitude:
                        continue
                                
                    # TODO: change this to annotation latlng
                    # Skip if missing necessary geospatial data
                    if question_group.latitude is None or question_group.longitude is None or question_group.distance_threshold_in_km is None:
                        continue
                    
                        
                    # Convert degrees to radians
                    lat1, lon1 = math.radians(user.location.latitude), math.radians(user.location.longitude)
                    lat2, lon2 = math.radians(question_group.latitude), math.radians(question_group.longitude)
                    
                    dlat = lat2 - lat1
                    dlon = lon2 - lon1
                    
                    # Haversine formula
                    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
                    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                    distance = 6371 * c 

                    print(distance, question_group.distance_threshold_in_km )
                    # Check if user is within the specific question's allowed threshold
                    if distance <= question_group.distance_threshold_in_km:
                        users_to_receive_survey_email.append(user)

            if len(users_to_receive_survey_email) > 0:                
                for u in users_to_receive_survey_email:      
                  send_invitation_email(u.email ,'survey')
            
            
            return Response({'question_group': qg_serializer.data, 'questions': s.data})





    def update(self, request, *args, **kwargs):
        with transaction.atomic():
            data = request.data.copy()

            report = self.get_object()

            serializer = ImpactReportSerializer(
                instance=report, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(serializer.data)

    @action(detail=False, methods=["GET"], url_name="get_survey_answers_for_report")
    def get_survey_answers_for_report(self, request):
        
        pk = request.query_params.get('reportID')
        report = ImpactReport.objects.filter(id=pk).first()
        if not report:
            return Response("Impact Report not found")
        
        questions = Question2.objects.filter(question_group__impact_report__pk=pk)
        if not questions.first():
            return Response({})
        qa_dict = {}
        for question in questions:
            answers_queryset = Answer.objects.filter(question__question_group__impact_report__pk=pk)
            serializer = AnswerMinimalSerializer(instance=answers_queryset, many=True)
            qa_dict[str(question.pk)] = {
                'question': question.question,
                'answers': serializer.data
                }
            
            
            
        
        
        return Response(qa_dict)
    
    

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=["GET"], url_name="get_user_details")
    def get_user_details(self, request):
        if request.user.is_anonymous:
            return Response()
        return Response(UserSerializer(instance=request.user).data)
    

    @action(detail=False, methods=["POST"], url_name="create_account")
    def create_account(self, request):
        data = request.data.copy()

        location_fields = {
            'latitude': data.pop('location_latitude', None),
            'longitude': data.pop('location_longitude', None),
            'name': data.pop('location_name', None),
            'description': data.pop('location_description', None),
            'country': data.pop('location_country', None),
            'state_province': data.pop('location_state_province', None),
            'city': data.pop('location_city', None),
            'street_address': data.pop('location_street_address', None),
        }
        location_values = {k: v for k, v in location_fields.items() if v not in (None, '', [])}

        with transaction.atomic():
            if location_values:
                location = Location.objects.create(**location_values)
                data['location_id'] = str(location.id)

            serializer = UserSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            u = serializer.save()
            u.set_password(request.data.get('password'))
            u.save()

        return Response(serializer.data)

    @action(detail=False, methods=["GET"], url_name="user_list_for_admin")
    def user_list_for_admin(self, request):
        queryset = User.objects.annotate(
            report_count=Count('impactreport')
        ).order_by('date_joined')
        serializer = UserAdminSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["POST"], url_name="set_active")
    def set_active(self, request, pk=None):
        user = self.get_object()
        is_active = request.data.get('is_active')
        if is_active is None:
            return Response(
                {"error": "is_active field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.is_active = bool(is_active)
        user.save(update_fields=['is_active'])
        return Response({"id": str(user.pk), "is_active": user.is_active})


class QuestionsViewSet(viewsets.ModelViewSet):
    queryset = Question2.objects.all()
    serializer_class = QuestionSerializer
    
    @action(detail=False, methods=["POST"], url_path="get-questions-in-bound")
    def get_questions_in_bound(self, request):
        # 1. Extract and validate user coordinates from query parameters
        user_lat = request.data.get('latitude')
        user_lon = request.data.get('longitude')
        
        if not user_lat or not user_lon:
            return Response(
                {"error": "Both 'latitude' and 'longitude' query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user_lat = float(user_lat)
            user_lon = float(user_lon)
        except ValueError:
            return Response(
                {"error": "Invalid coordinates. 'latitude' and 'longitude' must be floats."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Filter questions by active time frame first (Optimization)
        now = timezone.now()
        active_question_groups = QuestionGroup.objects.filter(
            start_time__lte=now,
            end_time__gte=now
        )

        valid_questions_groups = []

        # 3. Haversine Formula to calculate distance
        # (Earth radius ~6371 km)
        for question_group in active_question_groups:

                    
            
            # Skip if missing necessary geospatial data
            if question_group.latitude is None or question_group.longitude is None or question_group.distance_threshold_in_km is None:
                continue
                
            # Convert degrees to radians
            lat1, lon1 = math.radians(user_lat), math.radians(user_lon)
            lat2, lon2 = math.radians(question_group.latitude), math.radians(question_group.longitude)
            
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            
            # Haversine formula
            a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            distance = 6371 * c 

            # Check if user is within the specific question's allowed threshold
            if distance <= question_group.distance_threshold_in_km:
                valid_questions_groups.append(question_group)
        
        
        
        questions = Question2.objects.filter(question_group__in=valid_questions_groups)
        
        for question in questions:
            user_id = request.user.pk
            if user_id:
                # Skip if already answered this question  
                if Answer.objects.filter(question=question, reported_by__pk=user_id).first():
                    questions = questions.exclude(pk=question.pk)
                    continue

        
        serializer = self.get_serializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    
    
    @action(detail=False, methods=["POST"], url_path="set_survey_answers")
    def set_survey_answers(self, request):
        answers = request.data
        
        user_id = request.user.pk
        
        request_data = request.data.copy()
        data= []
        if user_id:
            for d in request_data:
                d['reported_by_pk'] = user_id
                data.append(d)

        serializer = AnswerSerializer(data=request.data, many=True)
        serializer.is_valid()
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    