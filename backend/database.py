from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = "quickresolveai"
COLLECTION_NAME = "complaints"

# Initialize MongoDB client
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
complaints_collection = db[COLLECTION_NAME]


def get_database():
    """Get MongoDB database instance"""
    return db


def get_complaints_collection():
    """Get complaints collection"""
    return complaints_collection


def create_indexes():
    """Create indexes for better query performance"""
    try:
        complaints_collection.create_index("created_at")
        complaints_collection.create_index("status")
        complaints_collection.create_index("priority")
        complaints_collection.create_index("category")
        print("Indexes created successfully")
    except Exception as e:
        print(f"Error creating indexes: {e}")


def convert_objectid_to_string(data):
    """Convert MongoDB ObjectId to string in dictionaries"""
    if isinstance(data, dict):
        converted = {}
        for key, value in data.items():
            output_key = "id" if key == "_id" else key
            if isinstance(value, ObjectId):
                converted[output_key] = str(value)
            elif isinstance(value, dict):
                converted[output_key] = convert_objectid_to_string(value)
            elif isinstance(value, list):
                converted[output_key] = [
                    convert_objectid_to_string(item) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                converted[output_key] = value
        return converted
    return data


def convert_objectid_in_list(data_list):
    """Convert ObjectId to string in list of dictionaries"""
    return [convert_objectid_to_string(item) for item in data_list]
