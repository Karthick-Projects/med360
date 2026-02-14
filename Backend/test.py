from pymongo import MongoClient

MONGO_URI = "mongodb+srv://megasaravanan14_db_user:eaM4UavAMSoL17sh@cluster0.nnzhoc8.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client.get_database("med360")
print(db.list_collection_names())  # Should print collections
