from rest_framework import serializers

from .models import ImpactReport, Location, Photo


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = '__all__'


class ImpactReportSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), source='location', write_only=True)

    photos_id = serializers.PrimaryKeyRelatedField(queryset=Photo.objects.all(), source='photos', write_only=True, many=True)

    photos = PhotoSerializer(read_only=True, many=True)


    class Meta:
        model = ImpactReport
        fields = '__all__'


