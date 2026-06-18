import math
from PIL import Image
from PIL.ExifTags import TAGS
from datetime import datetime

from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS, IFD


import random
import secrets


def haversine_distance(lat1, lon1, lat2, lon2):
    # Radius of the Earth in kilometers
    R = 6371.0

    # Convert latitude and longitude from degrees to radians
    radians_lat1 = math.radians(lat1)
    radians_lon1 = math.radians(lon1)
    radians_lat2 = math.radians(lat2)
    radians_lon2 = math.radians(lon2)

    # Difference in coordinates
    dlat = radians_lat2 - radians_lat1
    dlon = radians_lon2 - radians_lon1

    # Haversine formula
    a = math.sin(dlat / 2)**2 + math.cos(radians_lat1) * math.cos(radians_lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    # Calculate the distance
    distance_km = R * c
    return distance_km
def convert_to_decimal_degrees(value):
    """Helper to convert GPS rational tuples (degrees, minutes, seconds) to decimal."""
    try:
        d = float(value[0])
        m = float(value[1])
        s = float(value[2])
        return d + (m / 60.0) + (s / 3600.0)
    except (IndexError, TypeError, ZeroDivisionError):
        return None



from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS, IFD

def sanitize_for_json(value):
    """Recursively converts non-serializable EXIF data types into standard JSON types."""
    # 1. Handle Pillow's IFDRational objects (fractions)
    if hasattr(value, 'numerator') and hasattr(value, 'denominator'):
        try:
            return float(value)
        except ZeroDivisionError:
            return 0.0

    # 2. Handle nested tuples or lists (like GPS coordinates arrays)
    if isinstance(value, (tuple, list)):
        return [sanitize_for_json(v) for v in value]

    # 3. Handle nested dictionaries
    if isinstance(value, dict):
        return {str(k): sanitize_for_json(v) for k, v in value.items()}

    # 4. Handle raw binary byte segments (decode to string)
    if isinstance(value, bytes):
        return value.decode('utf-8', errors='ignore')

    # 5. Return standard types (ints, floats, strings, bools, None) as-is
    return value


def extract_exif_metadata(photo_file):
    raw_exif_data = {}
    captured_at = None
    
    try:
        img = Image.open(photo_file)
        exif = img.getexif()
        
        if not exif:
            return {}, None

        # Extract Core Metadata
        for key, val in exif.items():
            tag = TAGS.get(key, key)
            raw_exif_data[tag] = val

        # Capture timestamp safely before sanitization
        captured_at = raw_exif_data.get('DateTimeOriginal') or raw_exif_data.get('DateTime')
        if captured_at and isinstance(captured_at, bytes):
            captured_at = captured_at.decode('utf-8', errors='ignore')

        raise ValueError("TEST ERROR")
        # Extract Detailed Camera Metadata block (IFD Exif)
        try:
            exif_ifd = exif.get_ifd(IFD.Exif)
            for key, val in exif_ifd.items():
                tag = TAGS.get(key, key)
                raw_exif_data[tag] = val
        except Exception:
            pass

        # Extract GPS Metadata block
        try:
            gps_ifd = exif.get_ifd(IFD.GPSInfo)
            if gps_ifd:
                for key, val in gps_ifd.items():
                    tag = GPSTAGS.get(key, key)
                    raw_exif_data[f"GPS_{tag}"] = val
        except Exception:
            pass

    except Exception as e:
        print(f"Error reading EXIF data: {e}")
        return {}, None

    # --- CRITICAL FIX: Clean the entire dict before passing to Django/JSON ---
    clean_exif_data = sanitize_for_json(raw_exif_data)
    
    return clean_exif_data, captured_at




def generate_pseudonym() -> str:
    """
    Generates a human-readable, crisis-safe pseudonym.
    Uses the secrets module instead of random for cryptographically 
    stronger selections, reducing predictability.
    """
    
    # Strictly curated, culturally neutral lists
    adjectives = [
        "Calm", "Brave", "Swift", "Quiet", "Solid", 
        "Clear", "Bright", "Steady", "Keen", "Noble"
    ]
    
    nouns = [
        "River", "Stone", "Tree", "Bird", "Mountain", 
        "Cloud", "Rain", "Cedar", "Valley", "Hawk"
    ]
    
    # Select random elements using secrets for better entropy
    adj = secrets.choice(adjectives)
    noun = secrets.choice(nouns)
    
    # Generate a short number (10 to 999 for memorability vs. uniqueness)
    number = secrets.randbelow(990) + 10 
    
    # Combine with hyphens for readability
    return f"{adj}-{noun}-{number}"