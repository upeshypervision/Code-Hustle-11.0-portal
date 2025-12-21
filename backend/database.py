from pymongo import MongoClient
import certifi
import sys

# MongoDB Atlas Connection String
MONGO_URI = "mongodb+srv://blackfalconx69_db_user:t2k6FxnaHMkFYXM9@cluster0.ms0ky1p.mongodb.net/?appName=Cluster0"

try:
    # tlsCAFile=certifi.where() is essential for macOS users
    client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client["codehustle_hackathon"]
    
    # Check connection
    client.admin.command('ping')
    print("✅ MongoDB Connection Successful")
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")
    sys.exit(1)

def get_db():
    return db