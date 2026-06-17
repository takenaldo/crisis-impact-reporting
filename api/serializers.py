from rest_framework import serializers

from .models import Crisis, CrisisQuestion, CrisisQuestionAnswer,ImpactReport, Location, InfrastructureLocation, NatureOfCrisisQuestionAnswer, Photo, NatureOfCrisisQuestion



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


    class Meta:
        model = ImpactReport
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