import json

from django.db import transaction

from .models import Crisis, ImpactReport, Photo, CrisisQuestion, CrisisQuestionAnswer, NatureOfCrisisQuestion, NatureOfCrisisQuestionAnswer
from .serializers import CrisisSerializer, CrisisQuestionSerializer, CrisisQuestionAnswerSerializer, ImpactReportSerializer, NatureOfCrisisQuestionAnswerSerializer, NatureOfCrisisQuestionSerializer
from .serializers import InfrastructureLocationSerializer

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

        print('request.data', request.data.get("answers", []))
        
        
        
        photos = request.FILES.getlist('photos')
        photoDescriptions = json.loads(request.data.get('photoDescription', []))
        
        
        
        photo_ids = []
        for index, photo in enumerate(photos):
            p = Photo(image=photo)

            if 0 <= index < len(photoDescriptions):
                p.description = photoDescriptions[index]

            p.save()
            photo_ids.append(p.pk)

        data = request.data.copy()
        
        data['location_id'] = infrastructure_location.id
        data.setlist('photos_id', photo_ids)
        
        
        
        
        ser = ImpactReportSerializer(data=data)
        ser.is_valid(raise_exception=True)
        ser.save()

        answers = data.get('answers', None)
        if answers:
            answer_objects = json.loads(data.get('answers', None))
            print('answer_objects', answer_objects)
            for answer in answer_objects:
                question_id = answer.get('question_id')
                answer_text = answer.get('answer')
                impact_report_id = ser.data['id']
                noc_answer = CrisisQuestionAnswer(question_id=question_id, answer=answer_text, impact_report_id=impact_report_id)
                noc_answer.save()

        nocAnswers = data.get('noc_answers', None)
        if nocAnswers:
            noc_answer_objects = json.loads(nocAnswers)
            print('noc_answer_objects', noc_answer_objects)
            for answer in noc_answer_objects:
                question_id = answer.get('question_id')
                answer_text = answer.get('answer')
                impact_report_id = ser.data['id']
                noc_answer = NatureOfCrisisQuestionAnswer(question_id=question_id, answer=answer_text, impact_report_id=impact_report_id)
                noc_answer.save()


        
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
    
    