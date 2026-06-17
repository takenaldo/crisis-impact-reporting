from django.contrib.auth import get_user_model

from rest_framework import serializers

from .models import Answer, Crisis, CrisisQuestion, CrisisQuestionAnswer,ImpactReport, Location, InfrastructureLocation, NatureOfCrisisQuestionAnswer, Photo, NatureOfCrisisQuestion, Question2, QuestionGroup


User = get_user_model()

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), source='location', write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'job_title', 'organization', 'location', 'location_id']



class InfrastructureLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfrastructureLocation
        fields = '__all__'



class CrisisSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), source='location', write_only=True)

    number_of_reports = serializers.SerializerMethodField()

    class Meta:
        model = Crisis
        fields = '__all__'
        
    def get_number_of_reports(self, obj):
        return ImpactReport.objects.filter(crisis=obj).count()



class CrisesSerializerMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crisis
        fields = ['id', 'name']

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = '__all__'


        

class ImpactReportSerializer(serializers.ModelSerializer):
    
    crisis = CrisesSerializerMinimalSerializer(read_only=True)
    crisis_id = serializers.PrimaryKeyRelatedField(queryset=Crisis.objects.all(), source='crisis', write_only=True, required=False)
    
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
    reported_by = UserSerializer(read_only=True)

    class Meta:
        model = ImpactReport
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    question_group = ImpactReportSerializer(read_only=True)
    question_group_id = serializers.PrimaryKeyRelatedField(queryset=QuestionGroup.objects.all(), source='question_group', write_only=True, required=False)
    
    class Meta:
        model = Question2
        fields = '__all__'



class CrisisQuestionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CrisisQuestion
        fields = '__all__'
        

class CrisisQuestionAnswerSerializer(serializers.ModelSerializer):
    
    question = serializers.SerializerMethodField()
    
    class Meta:
        model = CrisisQuestionAnswer
        fields = '__all__'
        
        
    def get_question(self, obj):
        return obj.question.text
        
        
class NatureOfCrisisQuestionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = NatureOfCrisisQuestion
        fields = '__all__' 
        

class NatureOfCrisisQuestionAnswerSerializer(serializers.ModelSerializer):
    
    question = serializers.SerializerMethodField()
    
    class Meta:
        model = NatureOfCrisisQuestionAnswer
        fields = '__all__'
        
        
    def get_question(self, obj):
        return obj.question.text
    



class AnswerSerializer(serializers.ModelSerializer):

    impact_report = ImpactReportSerializer(read_only=True)
    impact_report_id = serializers.PrimaryKeyRelatedField(queryset=ImpactReport.objects.all(), source='impact_report', write_only=True, required=False)

    question = QuestionSerializer(read_only=True)
    question_id = serializers.PrimaryKeyRelatedField(queryset=Question2.objects.all(), source='question', write_only=True, required=False)

    reported_by_pk = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='reported_by', write_only=True, required=False)
    reported_by = UserSerializer(read_only=True)

    class Meta:
        model = Answer
        fields = ['impact_report', 'impact_report_id', 'question', 'question_id', 'answer', 'id', 'reported_by_pk', 'reported_by']


class QuestionGroupSerializer(serializers.ModelSerializer):

    impact_report = ImpactReportSerializer(read_only=True)
    impact_report_id = serializers.PrimaryKeyRelatedField(queryset=ImpactReport.objects.all(), source='impact_report', write_only=True, required=False)


    class Meta:
        model = QuestionGroup
        fields = ['impact_report_id', 'impact_report', 'id', 'latitude', 'longitude', 'distance_threshold_in_km', 'start_time', 'end_time']