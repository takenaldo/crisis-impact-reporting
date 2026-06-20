from django.contrib import admin

from .models import QuestionGroup, Question2, Answer, CIRUser, Location, Photo, ImpactReport, InfrastructureLocation

# Register your models here.

admin.site.register(CIRUser)

admin.site.register(Photo)
admin.site.register(ImpactReport)
admin.site.register(InfrastructureLocation)

admin.site.register(Location)

admin.site.register(Question2)
admin.site.register(Answer)
admin.site.register(QuestionGroup)