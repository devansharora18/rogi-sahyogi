import requests
import math

import os

def get_location():
    api_key = os.getenv("API")
    ipstack_url = f"http://api.ipstack.com/check?access_key={api_key}"
    try:
        response = requests.get(ipstack_url)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error retrieving location: {e}")
        return None

def get_hospital_details():
    hospital = {
        'name': "Christian Medical College Vellore (CMC Vellore)",
        'address': "IDA Scudder Road, Vellore, Tamil Nadu 632004, India",
        'lat': 12.9294,
        'lon': 79.1325,
        'rating': 4.8,
    }
    return hospital

def haversine(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    R = 6371.0 

    distance = R * c
    return distance

def send_sos_signal():
    location = get_location()
    if not location:
        print("Error retrieving location.")
        return

    city = location.get('city', 'Unknown City')
    country = location.get('country_name', 'Unknown Country')
    latitude = location.get('latitude', 0)
    longitude = location.get('longitude', 0)
    
    print(f"User's location: {city}, {country}")
    print(f"User coordinates: {latitude}, {longitude}")

    hospital = get_hospital_details()

    distance = haversine(latitude, longitude, hospital['lat'], hospital['lon'])


    print(f"Nearest Hospital: {hospital['name']}")
    print(f"Address: {hospital['address']}")
    print(f"Rating: {hospital['rating']} stars")
    print(f"Distance: {distance:.2f} km away")
    print("SOS SENT!!")

send_sos_signal()
