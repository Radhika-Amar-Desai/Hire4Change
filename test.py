
from pymongo.mongo_client import MongoClient

MONGODB_URI = "mongodb+srv://new_user:Radhika2@cluster.urbb9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster"
client = MongoClient(MONGODB_URI)

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)