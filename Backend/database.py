from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

load_dotenv()
# Read Mongo URI from environment
MONGO_URI = os.getenv("MONGO_URI")
print(MONGO_URI)
# Create Mongo client
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")  # Health check
    print("✅ MongoDB connected successfully")
except ConnectionFailure:
    raise RuntimeError("❌ Failed to connect to MongoDB")

# Database
db = client["med360"]

# Collections
users_collection = db["users"]
doctors_collection = db["doctors"]
admin_collection = db['admins']
appointments_collection = db["appointments"]
admission_collection = db['admission']
staff_collection = db['staff']
pharmacy_collection = db['pharmacy']
lab_report_collection = db['lab_report']
prescription_collection = db['prescriptions']
