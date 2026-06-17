import json
import math

from django.db import transaction
from django.http import QueryDict

from .models import Crisis, ImpactReport, Photo, CrisisQuestion, CrisisQuestionAnswer, NatureOfCrisisQuestion, NatureOfCrisisQuestionAnswer
from .serializers import CrisisSerializer, CrisisQuestionSerializer, CrisisQuestionAnswerSerializer, ImpactReportSerializer, NatureOfCrisisQuestionAnswerSerializer, NatureOfCrisisQuestionSerializer
from .serializers import InfrastructureLocationSerializer

from .utils import haversine_distance, extract_exif_metadata

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

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

        data = QueryDict(mutable=True)
        for key, values in request.data.lists():
            if key != 'photos':
                data.setlist(key, values)
        
        data['location_id'] = infrastructure_location.id
        data.setlist('photos_id', photo_ids)
        
        ser = ImpactReportSerializer(data=data)
        ser.is_valid(raise_exception=True)
        ser.save()

        answers = data.get('answers', None)
        if answers:
            answer_objects = json.loads(data.get('answers', None))
            for answer in answer_objects:
                question_id = answer.get('question_id')
                answer_text = answer.get('answer')
                impact_report_id = ser.data['id']
                noc_answer = CrisisQuestionAnswer(question_id=question_id, answer=answer_text, impact_report_id=impact_report_id)
                noc_answer.save()

        nocAnswers = data.get('noc_answers', None)
        if nocAnswers:
            noc_answer_objects = json.loads(nocAnswers)
            for answer in noc_answer_objects:
                question_id = answer.get('question_id')
                answer_text = answer.get('answer')
                impact_report_id = ser.data['id']
                noc_answer = NatureOfCrisisQuestionAnswer(question_id=question_id, answer=answer_text, impact_report_id=impact_report_id)
                noc_answer.save()



        # 


        
        return Response(ser.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["GET"], url_name="get_reports_for_crisis")
    def get_reports_for_crisis(self, request, pk):
        queryset = ImpactReport.objects.filter(crisis__pk=pk)
        serializer = ImpactReportSerializer(queryset, many=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=["GET"], url_name="get_qa_for_impact_report")
    def get_qa_for_impact_report(self, request, pk):
        queryset = CrisisQuestionAnswer.objects.filter(impact_report__pk=pk)
        serializer = CrisisQuestionAnswerSerializer(queryset, many=True)
        
        return Response(serializer.data)
    

    @action(detail=True, methods=["GET"], url_name="get_noc_qa_for_impact_report")
    def get_noc_qa_for_impact_report(self, request, pk):
        queryset = NatureOfCrisisQuestionAnswer.objects.filter(impact_report__pk=pk)
        serializer = NatureOfCrisisQuestionAnswerSerializer(queryset, many=True)
        
        return Response(serializer.data)

    @action(detail=False, methods=["GET"], url_name= "get_unmapped_imapct_reports")
    def get_unmapped_imapct_reports(self, request,):
        """
        Returns all reports that are unmapped to a particular crisis
        """
        queryset = ImpactReport.objects.filter(crisis__pk=None)
        serializer = ImpactReportSerializer(queryset, many=True)
        return Response(serializer.data)


    @action(detail=True, methods=["GET"], url_name= "get_mapping_recommendations")
    def get_mapping_recommendations(self, request, pk ):
        """
        Returns recommended crisis for the given unmapped impact report base on
            1. location proximity difference, the lesser the better
            2. time of impact difference,  the closer the better
            3. created at system time,  the closer the better
            4. nature of crisis matching
            
        Scores are added for each added crisis based on the difference on each parameter then from the whole crisis list the top 3 with the least score will be at the top 
        
        Coeffiecients are used to match the  power of each paarameter, like 96Hrs difference matches nature of crisis  matching whioch got 10 points by itself and 200KM distance 
        
        """

        impact_report = ImpactReport.objects.filter(pk=pk).first()
        if not impact_report:
            return Response("Impact report not found", status=status.HTTP_400_BAD_REQUEST)
        

        crisis_list = Crisis.objects.all()
        
        score_dict = {}

        HOURS_COEFFICIENT = 9.6
        DISTANCE_COEFFICIENT = 20
        
        score_dict = {}
        for crisis in crisis_list:
            score_dict[crisis] = 0
            
            if crisis.nature_of_crisis == impact_report.nature_of_crisis:
                score_dict[crisis] += 10
            
            if crisis.incident_datetime and impact_report.damage_datetime:
                diff_hrs = (crisis.incident_datetime - impact_report.damage_datetime).total_seconds() / 3600
                score_dict[crisis] += (diff_hrs / HOURS_COEFFICIENT)

            diff_hrs = (crisis.created_at - impact_report.created_at).total_seconds() / 3600
            score_dict[crisis] += (diff_hrs / HOURS_COEFFICIENT)
            if crisis.location.latitude and crisis.location.longitude and impact_report.location.infrastructure_latitude and impact_report.location.infrastructure_longitude:
                distance_in_km = haversine_distance(
                    crisis.location.latitude, crisis.location.longitude, impact_report.location.infrastructure_latitude, impact_report.location.infrastructure_longitude
                )
                score_dict[crisis] += (distance_in_km / DISTANCE_COEFFICIENT)
            
        sorted_dict_desc = sorted(score_dict.items(), key=lambda x: x[1])
        crisis_objects = [s[0] for s in sorted_dict_desc][:3]
        serializer = CrisisSerializer(instance=crisis_objects, many=True)
        return Response(serializer.data)



    def update(self, request, *args, **kwargs):
        with transaction.atomic():
            data = request.data.copy()

            report = self.get_object()

            serializer = ImpactReportSerializer(
                instance=report, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(serializer.data)



class CrisisViewSet(viewsets.ModelViewSet):
    queryset = Crisis.objects.all()
    serializer_class = CrisisSerializer
    lookup_value_regex = r'\d+'
    
    
    @action(detail=True, methods=["GET"], url_name="get_questions_for_crisis")
    def get_questions_for_crisis(self, request, pk):
        
        queryset = CrisisQuestion.objects.filter(crisis__pk=pk)
        serializer = CrisisQuestionSerializer(queryset, many=True)
        
        return Response(serializer.data)
    
    
class NatureOfCrisisQuestionViewSet(viewsets.ModelViewSet):
    queryset = NatureOfCrisisQuestion.objects.none()
    serializer_class = NatureOfCrisisQuestionSerializer
    
    @action(detail=False, methods=["GET"], url_name="get_nature_of_crisis_questions")
    def get_nature_of_crisis_questions(self, request):
        nature_of_crisis = request.query_params.get('nature_of_crisis', None)
        if not nature_of_crisis:
            return Response({'error': 'nature_of_crisis query parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = NatureOfCrisisQuestion.objects.filter(nature_of_crisis=str(nature_of_crisis).lower())
        serializer = NatureOfCrisisQuestionSerializer(queryset, many=True)
        return Response(serializer.data)
    
    