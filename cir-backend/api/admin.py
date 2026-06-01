from django.contrib import admin

from .models import Crisis, NatureOfCrisisQuestion, Photo, ImpactReport, Location, NatureOfCrisisQuestionAnswer, CrisisQuestion, CrisisQuestionAnswer

# Register your models here.

admin.site.register(Photo)
admin.site.register(ImpactReport)
admin.site.register(Location)

admin.site.register(NatureOfCrisisQuestion)
admin.site.register(NatureOfCrisisQuestionAnswer)
admin.site.register(CrisisQuestion)
admin.site.register(CrisisQuestionAnswer)
admin.site.register(Crisis)