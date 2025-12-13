from pymongo import MongoClient

# ⚠️ IMPORTANT: Replace with your actual connection string
MONGO_URI = "mongodb+srv://blackfalconx69_db_user:t2k6FxnaHMkFYXM9@cluster0.ms0ky1p.mongodb.net/?appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["codehustle_hackathon"]  # Database name
def get_db():
    return db
