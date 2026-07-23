import os
import pymongo
from dotenv import load_dotenv

# Load env variables from the .env file in the backend root directory
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(backend_dir, '.env'))

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI is not set in environment variables")

client = pymongo.MongoClient(MONGO_URI)
# Use the database name from URI if specified, otherwise fall back to 'findit_db'
db = client.get_database("findit_db")
print("MongoDB database connection initialized successfully!")
