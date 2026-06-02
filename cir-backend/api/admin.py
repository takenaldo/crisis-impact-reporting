from django.contrib import admin

from .models import Crisis, NatureOfCrisisQuestion, Location, Photo, ImpactReport, InfrastructureLocation, NatureOfCrisisQuestionAnswer, CrisisQuestion, CrisisQuestionAnswer

# Register your models here.

admin.site.register(Photo)
admin.site.register(ImpactReport)
admin.site.register(InfrastructureLocation)

admin.site.register(NatureOfCrisisQuestion)
admin.site.register(NatureOfCrisisQuestionAnswer)
admin.site.register(CrisisQuestion)
admin.site.register(CrisisQuestionAnswer)
admin.site.register(Crisis)
admin.site.register(Location)
