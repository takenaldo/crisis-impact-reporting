
from rest_framework import viewsets

from .models import Crisis, ImpactReport, InfrastructureLocation, Photo
from .serializers import CrisisSerializer, ImpactReportSerializer
from .serializers import InfrastructureLocationSerializer

from rest_framework.response import Response
from rest_framework import status

class ImpactReportViewSet(viewsets.ModelViewSet):
    queryset = ImpactReport.objects.all()
    serializer_class = ImpactReportSerializer



    def create(self, request, *args, **kwargs):

        print("Received data:", request.data)
        city = request.data.get('city')
        street_address = request.data.get('streetAddress')
        state_province = request.data.get('state')
        country = request.data.get('country')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')

        infrastructure_location_serializer = InfrastructureLocationSerializer(data=request.data)
        infrastructure_location_serializer.is_valid(raise_exception=True)
        infrastructure_location = infrastructure_location_serializer.save()


        photos = request.FILES.getlist('photos')
        photo_ids = []
        for photo in photos:
            p = Photo(image=photo)
            p.save()
            photo_ids.append(p.pk)



        data = request.data.copy()
        
        data['location_id'] = infrastructure_location.id
        
        # data['photos_id'] = photo_ids
        
        print('photo ids:', photo_ids)
        
        # Grab the inner list to make it flat
        # data['photos_id'] = photo_ids[0] if photo_ids and isinstance(photo_ids[0], list) else photo_ids

        # Flatten the list of lists into a single list
        # data['photos_id'] = [str(id) for id in photo_ids]
        
        print('data to be serialized:', data)
        data.setlist('photos_id', photo_ids)
        
        ser = ImpactReportSerializer(data=data)
        ser.is_valid(raise_exception=True)
        ser.save()
        
        return Response(ser.data, status=status.HTTP_201_CREATED)



class CrisisViewSet(viewsets.ModelViewSet):
    queryset = Crisis.objects.all()
    serializer_class = CrisisSerializer