import os
from django.contrib.auth import get_user_model

from rest_framework import serializers

from .models import Answer, ImpactReport, Location, InfrastructureLocation,Photo, Question2, QuestionGroup


User = get_user_model()

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), 
        source='location', 
        write_only=True,
        required=False
        )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'job_title', 'organization', 'location', 'location_id']


class UserMinimalSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'user']

    def get_user(self, obj):
        return obj.pseudonym if obj.pseudonym else obj.username



class InfrastructureLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfrastructureLocation
        fields = '__all__'



class PhotoSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    class Meta:
        model = Photo
        fields = '__all__'

    def get_image(self, obj):
        if obj.image and hasattr(obj.image, 'name'):
            # This strips away all folders and paths, leaving just "document.pdf"
            return "/"+os.path.basename(obj.image.name) 
        return None
        

class ImpactReportSerializer(serializers.ModelSerializer):
    
    
    location = InfrastructureLocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(queryset=InfrastructureLocation.objects.all(), source='location', write_only=True)


    photos = PhotoSerializer(read_only=True, many=True)

    photos_id = serializers.PrimaryKeyRelatedField(
            many=True,
            queryset=Photo.objects.all(),
            write_only=True,
            source='photos'
        )
    
    reported_by_pk = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='reported_by', write_only=True, required=False)
    reported_by = UserMinimalSerializer(read_only=True)

    class Meta:
        model = ImpactReport
        fields = '__all__'


class ImpactReportMinimalSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ImpactReport
        fields = ['id', 'infrastructure_type', 'infrastructure_name', 'damage_severity']


class QuestionGroupSerializer(serializers.ModelSerializer):

    impact_report = ImpactReportSerializer(read_only=True)
    impact_report_id = serializers.PrimaryKeyRelatedField(queryset=ImpactReport.objects.all(), source='impact_report', write_only=True, required=False)


    class Meta:
        model = QuestionGroup
        fields = ['impact_report_id', 'impact_report', 'id', 'latitude', 'longitude', 'distance_threshold_in_km', 'start_time', 'end_time']


class QuestionGroupMinimalSerializer(serializers.ModelSerializer):
    impact_report = ImpactReportSerializer(read_only=True)

    class Meta:
        model = QuestionGroup
        fields = ['id', 'impact_report']




class QuestionSerializer(serializers.ModelSerializer):
    question_group = QuestionGroupMinimalSerializer(read_only=True)
    question_group_id = serializers.PrimaryKeyRelatedField(queryset=QuestionGroup.objects.all(), source='question_group', write_only=True, required=False)
    
    class Meta:
        model = Question2
        fields = '__all__'


        

class AnswerSerializer(serializers.ModelSerializer):

    impact_report = ImpactReportSerializer(read_only=True)
    impact_report_id = serializers.PrimaryKeyRelatedField(queryset=ImpactReport.objects.all(), source='impact_report', write_only=True, required=False)

    question = QuestionSerializer(read_only=True)
    question_id = serializers.PrimaryKeyRelatedField(queryset=Question2.objects.all(), source='question', write_only=True, required=False)

    reported_by_pk = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='reported_by', write_only=True, required=False)
    reported_by = UserMinimalSerializer(read_only=True)

    class Meta:
        model = Answer
        fields = ['impact_report', 'impact_report_id', 'question', 'question_id', 'answer', 'id', 'reported_by_pk', 'reported_by']


class QuestionGroupSerializer(serializers.ModelSerializer):

    impact_report = ImpactReportSerializer(read_only=True)
    impact_report_id = serializers.PrimaryKeyRelatedField(queryset=ImpactReport.objects.all(), source='impact_report', write_only=True, required=False)


    class Meta:
        model = QuestionGroup
        fields = ['impact_report_id', 'impact_report', 'id', 'latitude', 'longitude', 'distance_threshold_in_km', 'start_time', 'end_time']