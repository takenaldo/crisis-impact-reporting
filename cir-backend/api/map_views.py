import math

from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response


def _calculate_bbox(lat, lng, radius_km):
    lat_offset = radius_km / 111.0
    lng_offset = radius_km / (111.0 * math.cos(math.radians(lat)))
    return {
        "min_lng": lng - lng_offset,
        "min_lat": lat - lat_offset,
        "max_lng": lng + lng_offset,
        "max_lat": lat + lat_offset,
    }


@api_view(["POST"])
def map_bbox(request):
    lat = request.data.get("latitude")
    lng = request.data.get("longitude")

    if lat is None or lng is None:
        return Response({"error": "latitude and longitude are required"}, status=400)

    try:
        lat, lng = float(lat), float(lng)
    except (TypeError, ValueError):
        return Response({"error": "latitude and longitude must be numbers"}, status=400)

    radius_km = float(request.data.get("radius_km") or settings.DEFAULT_BBOX_RADIUS_KM)
    return Response({"bbox": _calculate_bbox(lat, lng, radius_km)})
