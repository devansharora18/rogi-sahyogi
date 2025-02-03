import requests
import math
import random

# 🔑 Enter your IPStack API Key here
IPSTACK_API_KEY = "9454eaf313b116c719ae73825cfde1e9"

# 📍 Doctor List (Tamil Nadu, India)
doctors = [
    
    {"name": "Dr. Aditi Sharma", "district": "Chennai", "latitude": 13.0827, "longitude": 80.2707, "phone": "+91 9876543210", "address": "123 Main St, Chennai"},
    {"name": "Dr. Rajesh Kumar", "district": "Chennai", "latitude": 13.0878, "longitude": 80.2785, "phone": "+91 9876543211", "address": "456 Park Rd, Chennai"},
    {"name": "Dr. Pooja Verma", "district": "Nellore", "latitude": 14.4412, "longitude": 79.9743, "phone": "+91 9876543212", "address": "789 Riverside Ave, Nellore"},
    {"name": "Dr. Vikram Patel", "district": "Katpadi", "latitude": 12.9360, "longitude": 78.7093, "phone": "+91 9876543213", "address": "101 College St, Katpadi"},
    {"name": "Dr. Ananya Bose", "district": "Vellore", "latitude": 12.9200, "longitude": 78.1475, "phone": "+91 9876543214", "address": "202 Hospital Rd, Vellore"},
    {"name": "Dr. Sunil Nair", "district": "Vellore", "latitude": 11.6733, "longitude": 77.7138, "phone": "+91 9876543215", "address": "303 Medical Lane, Vellore"},
    {"name": "Dr. Sneha Kapoor", "district": "Vellore", "latitude": 12.9180, "longitude": 79.1340, "phone": "+91 9876543216", "address": "404 Health Ave, Vellore"},
    {"name": "Dr. Alok Mehta", "district": "Chennai", "latitude": 13.0765, "longitude": 80.2786, "phone": "+91 9876543217", "address": "505 Clinic St, Chennai"},
    {"name": "Dr. Priya Iyer", "district": "Ongole", "latitude": 15.5045, "longitude": 80.0487, "phone": "+91 9876543218", "address": "606 Wellness Blvd, Ongole"},
    {"name": "Dr. Karthik Raman", "district": "Chennai", "latitude": 13.0733, "longitude": 80.2780, "phone": "+91 9876543219", "address": "707 Care St, Chennai"}


]

# 📍 Get User Location from IPStack
def get_user_location():
    url = f"http://api.ipstack.com/check?access_key={IPSTACK_API_KEY}"
    response = requests.get(url)
    location_data = response.json()
    
    if location_data.get("latitude") is None or location_data.get("longitude") is None:
        # If IPStack fails, fallback to a default location (Chennai)
        return 13.0827, 80.2707  # Default to Chennai

    return location_data.get("latitude"), location_data.get("longitude")

# 🧮 Calculate Distance Using Haversine Formula
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth's radius in km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    
    # 🛠 Fix potential math domain errors by ensuring 'a' stays within [0, 1]
    a = min(1, max(0, a))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

# 🚀 Find the 5 Nearest Doctors
def find_nearest_doctors(user_lat, user_lon):
    for doctor in doctors:
        doc_lat, doc_lon = doctor["latitude"], doctor["longitude"]
        distance = haversine(user_lat, user_lon, doc_lat, doc_lon)        


        # 🏆 Assign random rating between 3 to 4.8
        doctor["rating"] = round(random.uniform(3.0, 4.8), 1)
        
        # 🏅 Assign random experience between 5 to 20 years
        doctor["experience"] = random.randint(5, 20)

        doctor["distance"] = round(distance, 2)

    # 📌 Sort doctors by nearest distance
    doctors.sort(key=lambda d: d["distance"])
    return doctors[:5]

# 🎯 Main Function
def main():
    user_lat, user_lon = get_user_location()

    if user_lat is None or user_lon is None:
        print("❌ Error: Could not get user location.")
        return

    nearest_doctors = find_nearest_doctors(user_lat, user_lon)

    print("\n🩺 Top 5 Nearest Doctors:")
    for doctor in nearest_doctors:
        print(f"✅ {doctor['name']} ({doctor['district']}) - {doctor['distance']} km away | "
              f"📞 {doctor['phone']} | 🏠 {doctor['address']} | ⭐ Rating: {doctor['rating']} | 🏅 Experience: {doctor['experience']} years")

# 🔥 Run the script
if __name__ == "__main__":
    main()
