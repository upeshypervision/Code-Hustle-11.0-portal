from pymongo import MongoClient
import certifi

# ⚠️ to solve CERTIFI error for mac
ca = certifi.where()

MONGO_URI = "mongodb+srv://blackfalconx69_db_user:t2k6FxnaHMkFYXM9@cluster0.ms0ky1p.mongodb.net/?appName=Cluster0"

# TLS_ALLOW_INVALID_CERTIFICATES is a backup if certifi doesn't work
client = MongoClient(MONGO_URI, tlsCAFile=ca) 

db = client["codehustle_hackathon"]

def get_db():
    return db