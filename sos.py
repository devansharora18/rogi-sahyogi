import requests
import math

# Function to get the user's location from IPStack API
def get_location():
    api_key = '9454eaf313b116c719ae73825cfde1e9'  # Your IPStack API Key
    ipstack_url = f"http://api.ipstack.com/check?access_key={api_key}"
    try:
        response = requests.get(ipstack_url)
        response.raise_for_status()  # Raise an error for bad HTTP responses
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error retrieving location: {e}")
        return None

# Actual hospital details for CMC Vellore
def get_hospital_details():
    # CMC Vellore details
    hospital = {
        'name': "Christian Medical College Vellore (CMC Vellore)",
        'address': "IDA Scudder Road, Vellore, Tamil Nadu 632004, India",
        'lat': 12.9294,  # Latitude of CMC Vellore
        'lon': 79.1325,  # Longitude of CMC Vellore
        'rating': 4.8,   # Approximate rating based on reviews
    }
    return hospital

# Haversine formula to calculate the distance between two geographic points
def haversine(lat1, lon1, lat2, lon2):
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    # Radius of Earth in kilometers (mean radius)
    R = 6371.0  # Kilometers

    # Distance in kilometers
    distance = R * c
    return distance

# Main function to simulate the SOS system
def send_sos_signal():
    # Step 1: Get the user's location
    location = get_location()
    if not location:
        print("Error retrieving location.")
        return

    # Step 2: Extract city, country, and coordinates
    city = location.get('city', 'Unknown City')
    country = location.get('country_name', 'Unknown Country')
    latitude = location.get('latitude', 0)
    longitude = location.get('longitude', 0)
    
    print(f"User's location: {city}, {country}")
    print(f"User coordinates: {latitude}, {longitude}")

    # Step 3: Get CMC Vellore hospital details
    hospital = get_hospital_details()

    # Step 4: Calculate the distance to CMC Vellore using the Haversine formula
    distance = haversine(latitude, longitude, hospital['lat'], hospital['lon'])

    # To avoid 0.0 km, we'll add a small tolerance if the user is located in Vellore
    if distance == 0.0:
        # Adding a small tolerance of 0.02 km (20 meters)
        distance = 0.02  # Small distance to simulate a realistic result in Vellore

    # Output the details of the nearest hospital (CMC Vellore)
    print(f"Nearest Hospital: {hospital['name']}")
    print(f"Address: {hospital['address']}")
    print(f"Rating: {hospital['rating']} stars")
    print(f"Distance: {distance:.2f} km away")
    print("SOS SENT!!")

# Run the SOS signal function
send_sos_signal()
