import requests
import math
import random
import os

IPSTACK_API_KEY = os.getenv("API")

doctors = [
    {"name": "Dr. Aditi Sharma", "district": "Chennai", "latitude": 13.0827, "longitude": 80.2707, "phone": "+91 9876543210", "address": "Apollo Hospitals, Greams Road, Chennai"},
    {"name": "Dr. Rajesh Kumar", "district": "Chennai", "latitude": 13.0569, "longitude": 80.2425, "phone": "+91 9876543211", "address": "Fortis Malar Hospital, Adyar, Chennai"},
    {"name": "Dr. Vikram Patel", "district": "Vellore", "latitude": 12.9165, "longitude": 79.1325, "phone": "+91 9876543213", "address": "Christian Medical College, Vellore"},
    {"name": "Dr. Ananya Bose", "district": "Coimbatore", "latitude": 11.0168, "longitude": 76.9558, "phone": "+91 9876543214", "address": "PSG Hospitals, Peelamedu, Coimbatore"},
    {"name": "Dr. Sunil Nair", "district": "Madurai", "latitude": 9.9252, "longitude": 78.1198, "phone": "+91 9876543215", "address": "Meenakshi Mission Hospital, Madurai"},
    {"name": "Dr. Sugantha Meenskshi E", "district": "Vellore", "latitude": 12.8242, "longitude": 79.1331, "phone": "+91 9876543220", "address": "Rattina Mangalam, Vellore"},
    {"name": "Dr. Pavithra Mahendran", "district": "Vellore", "latitude": 12.7409, "longitude": 79.3502, "phone": "+91 9876543221", "address": "Katpadi, Vellore"},
    {"name": "Dr. L T Thenmozhi", "district": "Vellore", "latitude": 12.9665, "longitude": 79.3961, "phone": "+91 9876543222", "address": "Sholinghur, Vellore"},
    {"name": "Dr. Karthik Raman", "district": "Vellore", "latitude": 12.9141, "longitude": 79.1325, "phone": "+91 9876543223", "address": "Sri Ragavendra Super Speciality Hospital, Vellore"},
    {"name": "Dr. Priya Iyer", "district": "Vellore", "latitude": 12.9173, "longitude": 79.1324, "phone": "+91 9876543224", "address": "K V R Kidney & Diabetic Centre, Vellore"},
    {"name": "Dr. Alok Mehta", "district": "Vellore", "latitude": 12.9254, "longitude": 79.1348, "phone": "+91 9876543225", "address": "Vellore Eye and Dental Hospital, Vellore"},
    {"name": "Dr. Sneha Kapoor", "district": "Vellore", "latitude": 12.9684, "longitude": 79.1362, "phone": "+91 9876543226", "address": "Sri Sakthi Amma Hospital, Sathuvachari, Vellore"},
    {"name": "Dr. Pooja Verma", "district": "Vellore", "latitude": 12.6819, "longitude": 79.2829, "phone": "+91 9876543227", "address": "Sri Sakthi Amma Clinic, Arni"},
    {"name": "Dr. Arun Kumar", "district": "Vellore", "latitude": 12.9467, "longitude": 78.8755, "phone": "+91 9876543228", "address": "Sri Sakthi Amma Specialty Clinic, Gudiyatham"},
    {"name": "Dr. Lakshmi Narayanan", "district": "Vellore", "latitude": 12.9180, "longitude": 79.1324, "phone": "+91 9876543229", "address": "Nalam Medical Centre and Hospital, Sathuvachari, Vellore"}
]

def get_user_location():
    url = f"http://api.ipstack.com/check?access_key={IPSTACK_API_KEY}"
    response = requests.get(url)
    location_data = response.json()
    
    if location_data.get("latitude") is None or location_data.get("longitude") is None:
        return 13.0827, 80.2707

    return location_data.get("latitude"), location_data.get("longitude")

def haversine(lat1, lon1, lat2, lon2):
    R = 6371 
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    
    a = min(1, max(0, a))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def find_nearest_doctors(user_lat, user_lon):
    for doctor in doctors:
        doc_lat, doc_lon = doctor["latitude"], doctor["longitude"]
        distance = haversine(user_lat, user_lon, doc_lat, doc_lon)        

        doctor["rating"] = round(random.uniform(3.0, 4.8), 1)
        
        doctor["experience"] = random.randint(5, 20)

        doctor["distance"] = round(distance, 2)

    doctors.sort(key=lambda d: d["distance"])
    return doctors[:5]

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

if __name__ == "__main__":
    main()
