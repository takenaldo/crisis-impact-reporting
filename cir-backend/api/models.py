from datetime import datetime
import os
import uuid

from django.contrib.auth import get_user_model

from django.contrib.auth.models import AbstractUser
from django.db import models

from .constants import CardinalDirection, CrisisCategory, DamageSeverity, HealthServicesRatingLevel, ElectrictyDamageLevel

# User = get_user_model()


def get_timestamp_path(instance, filename):
    ext = filename.split('.')[-1]
    # Format: 20260514-113045.jpg
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    filename = f"{timestamp}.{ext}"
    return os.path.join('', filename)




class Photo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    image = models.FileField(upload_to=get_timestamp_path)
    description = models.CharField(max_length=255, blank=True, null=True)

    exif_data = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.image.name if self.image else self.description


class InfrastructureLocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    infrastructure_latitude = models.FloatField(blank=True, null=True)
    infrastructure_longitude = models.FloatField(blank=True, null=True)
    infrastructure_location_description = models.CharField(
        max_length=255, blank=True, null=True, help_text="Free text description of the infrastructure location")
    infrastructure_location_name = models.CharField(
        max_length=255, blank=True, null=True, help_text="Name of the infrastructure location (e.g., 'Main Street Bridge', 'Downtown Intersection', etc.)")

    submit_location_latitude = models.FloatField(blank=True, null=True)
    submit_location_longitude = models.FloatField(blank=True, null=True)
    submit_location_description = models.CharField(
        max_length=255, blank=True, null=True, help_text="Free text description of the submit location")
    submit_location_name = models.CharField(max_length=255, blank=True, null=True,
                                            help_text="Name of the submit location (e.g., 'Main Street Bridge', 'Downtown Intersection', etc.)")

    submit_location_to_infrastructure_distance = models.FloatField(
        blank=True, null=True, help_text="Distance in meters from the submit location to the infrastructure location.")

    submit_location_to_infrastructure_direction_degrees = models.FloatField(
        blank=True, null=True, help_text="Direction from the submit location to the infrastructure location in degrees (0-360, where 0/360 is north, 90 is east, 180 is south, and 270 is west).")

    submit_location_to_infrastructure_direction_cardinal = models.CharField(
        choices=CardinalDirection.choices,
        max_length=255, blank=True, null=True, help_text="Cardinal direction from the submit location to the infrastructure location (e.g., 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW').")

    submit_location_to_infrastructure_direction_description = models.CharField(
        max_length=255, blank=True, null=True, help_text="Free text description of the direction from the submit location to the infrastructure location")

    country = models.CharField(max_length=255, blank=True, null=True)
    state_province = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    street_address = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.infrastructure_location_name or "Location"


class Location(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    description = models.CharField(
        max_length=255, blank=True, null=True, help_text="Free text description of the location")
    name = models.CharField(max_length=255, blank=True, null=True,
                            help_text="Name of the location (e.g., 'Main Street Bridge', 'Downtown Intersection', etc.)")

    country = models.CharField(max_length=255, blank=True, null=True)
    state_province = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    street_address = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.country + " - " + self.state_province + " - " + self.city + " - " + self.street_address if self.country and self.state_province and self.city and self.street_address else self.name or self.description or "Location"




class CIRUser(AbstractUser):
    location = models.ForeignKey(Location, on_delete=models.RESTRICT, blank=True, null=True)
    job_title = models.CharField(max_length=100)
    organization = models.CharField(max_length=100)
    
    def __str__(self):
        return self.username



class Crisis(models.Model):
    """
    Model representing a crisis event. This can be linked to multiple ImpactReports to indicate that they are all related to the same crisis event. For example, if there is a major earthquake, there may be multiple impact reports from different locations and infrastructures, but they can all be linked to the same Crisis instance to indicate that they are part of the same overall event.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(max_length=255, blank=True, null=True)
    category = models.CharField(
        max_length=255, blank=True, null=True, choices=CrisisCategory.choices)

    nature_of_crisis = models.CharField(max_length=255, blank=True, null=True,
                                        help_text="e.g., earthquake, flood, hurricane, etc."
                                        )
    nature_of_crisis_category = models.CharField(max_length=255, blank=True, null=True,
                                                 choices=CrisisCategory.choices,
                                                 help_text="e.g., natural disaster, human-made crisis, etc.",)

    incident_datetime = models.DateTimeField(
        blank=True, null=True, help_text="Date and time when the incident occurred. If unknown, this can be left blank.")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    location = models.ForeignKey(Location, on_delete=models.SET_NULL, blank=True, null=True,
                                 help_text=""
                                 )

    def __str__(self):
        return self.name or "Crisis"

    class Meta:
        verbose_name_plural = "Crises"


class ImpactReport(models.Model):
    """
    Model representing an impact report submitted by a user. This includes information about the damage to infrastructure, the nature of the crisis, and the location of the incident. Each ImpactReport can be linked to multiple photos and one location. Additionally, each ImpactReport can be linked to a Crisis to indicate that it is part of a larger crisis event.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    crisis = models.ForeignKey(Crisis, on_delete=models.SET_NULL, blank=True, null=True,
                               help_text="The crisis event that this impact report is related to. This can be left blank if the report is not linked to a specific crisis event.")
    photos = models.ManyToManyField(Photo)
    description = models.TextField(max_length=255, blank=True, null=True)
    infrastructure_name = models.CharField(
        max_length=255, blank=True, null=True)
    infrastructure_type = models.CharField(max_length=255, blank=True, null=True,
                                           help_text="e.g., bridge, road, building, etc."
                                           )

    infrastructure_description = models.TextField(
        max_length=255, blank=True, null=True)

    damage_severity = models.CharField(
        max_length=255, choices=DamageSeverity.choices, blank=True, null=True)

    nature_of_crisis = models.CharField(max_length=255, blank=True, null=True,
                                        help_text="e.g., earthquake, flood, hurricane, etc."
                                        )
    nature_of_crisis_category = models.CharField(max_length=255, blank=True, null=True,
                                                 choices=CrisisCategory.choices,
                                                 help_text="e.g., natural disaster, human-made crisis, etc.",)

    debris = models.BooleanField(
        default=False, help_text="Indicates if there is debris present at the site.")
    debris_description = models.TextField(
        max_length=255, blank=True, null=True, help_text="Description of the debris, if present.")

    accessibility = models.BooleanField(default=True,
                                        help_text="Indicates if the infrastructure is accessible or not.")

    location = models.ForeignKey(
        InfrastructureLocation, on_delete=models.CASCADE, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    damage_datetime = models.DateTimeField(
        blank=True, null=True, help_text="Date and time when the incident occurred. If unknown, this can be left blank.")

    immediate_action = models.BooleanField(
        default=False, help_text="Does the infrastructure damage needs an immediate action")
    immediate_action_reason = models.CharField(
        max_length=255, blank=True, null=True, help_text="Reason why the infrastructure needs an immediate action, if immediate action is checked true")

    is_critical_infrastructure = models.BooleanField(
        default=False, help_text="Shows if the infrtastructure is a critical one for the community like hospitals, schools and so on")

    electricity_condition = models.CharField(
        max_length=20,
        choices=ElectrictyDamageLevel.choices,
        default=ElectrictyDamageLevel.NO_DAMAGE
    )
    health_services_rating = models.CharField(
        max_length=20,
        choices=HealthServicesRatingLevel.choices,
        default=HealthServicesRatingLevel.UNKNOWN
    )

    pressing_need = models.TextField(default="")
    
    
    reported_by = models.ForeignKey(
        get_user_model(),
        null=True,
        blank=True,
        on_delete=models.RESTRICT
    )

    def __str__(self):
        return (self.crisis.name if self.crisis else "") + " - Impact Report " + str(self.infrastructure_name) + str(self.infrastructure_type)


class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.CharField(max_length=255)

    choice_options = models.JSONField(
        blank=True, null=True, help_text="A JSON array of multiple choice options for the question, if applicable. For example: ['Option 1', 'Option 2', 'Option 3']. If the question is not multiple choice, this can be left blank.")

    is_multiple_choice = models.BooleanField(
        default=False, help_text="Indicates whether the question is a multiple choice question or not.")

    class Meta:
        abstract = True

    def __str__(self):
        return self.text
    
class QuestionGroup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    latitude = models.FloatField()
    longitude = models.FloatField()
    
    distance_threshold_in_km = models.FloatField()
    
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()


    impact_report = models.ForeignKey(ImpactReport, on_delete=models.CASCADE, default=None, null=True, blank=True)


class Question2(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.CharField(max_length=255)

    choice_options = models.JSONField(
        blank=True, null=True, help_text="A JSON array of multiple choice options for the question, if applicable. For example: ['Option 1', 'Option 2', 'Option 3']. If the question is not multiple choice, this can be left blank.")

    is_multiple_choice = models.BooleanField(
        default=False, help_text="Indicates whether the question is a multiple choice question or not.")


    question_group= models.ForeignKey(QuestionGroup, on_delete=models.SET_NULL, blank=True, null=True)


    def __str__(self):
        return self.question


class Answer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(
        Question2, on_delete=models.CASCADE, db_index=True)
    answer = models.CharField(max_length=255, blank=True, null=True,
                              help_text="The answer provided for the question in relation to the specific impact report. For multiple choice questions, this should be one of the options provided in the Question's choice_options field.")

    reported_by = models.ForeignKey(
        get_user_model(),
        null=True,
        blank=True,
        on_delete=models.RESTRICT
    )

    
    def __str__(self):
        return f"Answer to '{self.question.question}': '{self.answer}'"




class NatureOfCrisisQuestion(Question):
    nature_of_crisis = models.CharField(max_length=255, blank=True, null=True,
                                        help_text="The nature of the crisis (e.g., earthquake, flood, hurricane, etc.) that the question is related to.")


class NatureOfCrisisQuestionAnswer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(
        NatureOfCrisisQuestion, on_delete=models.CASCADE, db_index=True)
    impact_report = models.ForeignKey(ImpactReport, on_delete=models.CASCADE)
    answer = models.CharField(max_length=255, blank=True, null=True,
                              help_text="The answer provided for the question in relation to the specific impact report. For multiple choice questions, this should be one of the options provided in the Question's choice_options field.")

    def __str__(self):
        return f"Answer to '{self.question.text}': '{self.answer}'"


class CrisisQuestion(Question):
    crisis = models.ForeignKey(Crisis, on_delete=models.CASCADE, blank=True, null=True,
                               help_text="The crisis event that this question is related to. This can be left blank if the question is not linked to a specific crisis event.")


class CrisisQuestionAnswer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(CrisisQuestion, on_delete=models.CASCADE, db_index=True)
    answer = models.CharField(max_length=255, blank=True, null=True,
                              help_text="The answer provided for the question in relation to the specific impact report. For multiple choice questions, this should be one of the options provided in the Question's choice_options field.")
    impact_report = models.ForeignKey(
        ImpactReport, on_delete=models.CASCADE, default=None, blank=None, null=None)

    def __str__(self):
        return f"Answer to '{self.question.text}': '{self.answer}'"
