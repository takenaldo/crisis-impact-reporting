from rest_framework import serializers

from .models import Crisis, ImpactReport, Location, InfrastructureLocation, Photo



class InfrastructureLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfrastructureLocation
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'


class CrisisSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), source='location', write_only=True)

    class Meta:
        model = Crisis
        fields = '__all__'


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = '__all__'


class ImpactReportSerializer(serializers.ModelSerializer):
    
    crisis = CrisisSerializer(read_only=True)
    crisis_id = serializers.PrimaryKeyRelatedField(queryset=Crisis.objects.all(), source='crisis', write_only=True)
    
    location = InfrastructureLocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(queryset=InfrastructureLocation.objects.all(), source='location', write_only=True)


    photos = PhotoSerializer(read_only=True, many=True)

    photos_id = serializers.PrimaryKeyRelatedField(
            many=True,
            queryset=Photo.objects.all(),
            write_only=True,
            source='photos'
        )


    class Meta:
        model = ImpactReport
        fields = '__all__'