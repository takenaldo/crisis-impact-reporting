from django.db import models


class DamageSeverity(models.TextChoices):
    NO_DAMAGE = 'No Damage'
    MINIMAL = 'Minimal'
    PARTIAL = 'Partial'
    COMPLETE = 'Complete'


class CrisisCategory(models.TextChoices):
    NATURAL_HAZARDS = 'Natural Hazards'
    TECHNOLOGICAL_INDUSTRAL_HAZARDS = 'Technological/Industrial Hazards'
    HUMANMADE_CRISIS = 'Human-Made Crisis'
    
class CardinalDirection(models.TextChoices):
    N = 'N'
    NE = 'NE'
    E = 'E'
    SE = 'SE'
    S = 'S'
    SW = 'SW'
    W = 'W'
    NW = 'NW'
    

class ElectrictyDamageLevel(models.TextChoices):
    NO_DAMAGE= 'no_damage'
    MINOR = 'minor'
    MODERATE = 'moderate'
    SEVERE = 'severe'
    DESTROYED = 'destroyed'
    UNKNOWN = 'unknown'
 
 
class HealthServicesRatingLevel(models.TextChoices):
    FULLY = 'fully'
    PARTIAL = 'partial'
    LARGLY_DISRUPTED = 'largely_disrupted'
    NOT_FUNCTIONING = 'not_functioning'
    UNKNOWN = 'unknown'
