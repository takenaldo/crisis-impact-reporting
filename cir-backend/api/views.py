import json
import math

from django.db import transaction
from django.db.models import Count
from django.http import QueryDict
from django.utils import timezone

from datetime import timedelta

# Avoid doing this if possible
from django.contrib.auth import get_user_model

from .models import QuestionGroup, Question2,Crisis, ImpactReport, Photo, CrisisQuestion, CrisisQuestionAnswer, NatureOfCrisisQuestion, NatureOfCrisisQuestionAnswer, Answer
from .serializers import CrisisSerializer, CrisisQuestionSerializer, CrisisQuestionAnswerSerializer, ImpactReportSerializer, NatureOfCrisisQuestionAnswerSerializer, NatureOfCrisisQuestionSerializer
from .serializers import InfrastructureLocationSerializer
from .serializers import UserSerializer
from .serializers import QuestionSerializer
from .serializers import AnswerSerializer
from .serializers import QuestionGroupSerializer




from .utils import haversine_distance, extract_exif_metadata

from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()



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
        
        ser = ImpactReportSerializer(data=data)
        ser.is_valid(raise_exception=True)
        ser.save()

        if annotations_raw:
            try:
                ser.instance.annotations = json.loads(annotations_raw)
                ser.instance.save(update_fields=['annotations'])
            except (json.JSONDecodeError, TypeError):
                pass

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



    @action(detail=False, methods=["GET"], url_name= "get_user_reports")
    def get_user_reports(seld, request):
        """
        Returns all reports created by a user
        """
        queryset = ImpactReport.objects.filter(reported_by__pk=request.user.pk)
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

            print(data)

            qg_serializer = QuestionGroupSerializer(data=data)
            qg_serializer.is_valid(raise_exception=True)
            qg = qg_serializer.save()

            questions_list = request.data.get('questions', []) 
            for question in questions_list:
                question['question_group_id'] = qg.pk

            s = QuestionSerializer(data=questions_list, many=True)
            s.is_valid(raise_exception=True)
            s.save()
            
            
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
    

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    
    @action(detail=False, methods=["GET"], url_name="get_user_details")
    def get_user_details(self, request):
        user = request.user
        
        return Response(UserSerializer(instance=user).data)
    

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
        
        unanswered_questions = questions
        for question in questions:
            user_id = request.user.pk
            if user_id:
                # Skip if already answered this question  
                if Answer.objects.filter(question=question, reported_by__pk=user_id).first():
                    questions = questions.exclude(pk=question.pk)
                    continue

        
        # 4. Serialize and return data
        # Note: many=True is required since we are returning a list of questions
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
        
    