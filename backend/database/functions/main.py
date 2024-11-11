# main.py
from firebase_admin import initialize_app, storage
from firebase_functions import https_fn
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson import json_util
import json
import base64
from uuid import uuid4 
import traceback
from bson import ObjectId
from bson.errors import InvalidId
from jobs import fetch_job, create_job, search_jobs, apply_job, posted_jobs, assign_jobs, complete_job
from messages import message, get_conversation, get_all_messages 

load_dotenv()
MONGODB_URI = "mongodb+srv://Project1:Radhika@cluster.urbb9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster&tls=true&tlsAllowInvalidCertificates=true"
client = MongoClient(MONGODB_URI)


initialize_app()
app = Flask(__name__)
CORS(app)  

try:
    database = client.get_database("Users")
    collection = database.get_collection("Job_listings")
    bugs = database.get_collection("Bugs")
    users = database.get_collection("Users")
    messages = database.get_collection("Messages")
    transactions = database.get_collection("Transactions")
except PyMongoError as e:
    app.logger.error(f"Failed to connect to MongoDB: {str(e)}")
    

def upload_image(image_data):
    try:
        image_bytes = base64.b64decode(image_data)
        filename = f"images/{uuid4()}.jpg"
        bucket = storage.bucket()
        
        blob = bucket.blob(filename)
        blob.upload_from_string(image_bytes, content_type='image/jpeg')
        
        blob.make_public()
        
        return blob.public_url
    except Exception as e:
        app.logger.error(f"Error uploading image: {str(e)}")
        return str(e)

@app.route("/add-bug", methods=['POST'])
def add_bug():
    try:
        
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        current_date = datetime.now().isoformat()
        data['server_date'] = current_date
        result = bugs.insert_one(data)
        
        if result.acknowledged:
            return jsonify({"message": "Data inserted successfully", "id": str(result.inserted_id)}), 201
        else:
            return jsonify({"error": "Failed to insert data"}), 500
    except PyMongoError as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
# Jobing
@app.route("/fetch-job/<job_id>", methods=['GET'])
def fetch_job_route(job_id):
    return fetch_job(job_id, collection, app.logger)

@app.route("/create-job-listing", methods=['POST'])
def create_job_route():
    return create_job(request.json, users,collection, upload_image, app.logger)

@app.route("/search-job-listing", methods=['POST'])
def search_job_route():
     return search_jobs(request.json,collection,app.logger)

@app.route("/apply-job", methods=['POST'])
def apply_job_route():
    return apply_job(request.json, collection, users, app.logger)

@app.route("/posted-jobs",methods=['POST'])
def posted_jobs_route():
    return posted_jobs(request.json,users,app.logger)

@app.route("/assign-job", methods=['POST'])
def assign_job_route():
    return assign_jobs(request.json, users, collection, transactions, app.logger)

@app.route("/complete-job", methods=['POST'])
def complete_jobs_route():
    return complete_job(request.json, users, collection, transactions, app.logger)

# Messagin
@app.route("/message", methods=['POST'])
def message_route():
    if request.json:
        return message(request.json, messages, upload_image, app.logger)
    else:
        return jsonify({"error": "Invalid request data"}), 400

@app.route("/get-conversation", methods=['POST'])
def get_conversation_route():
    if request.json:
        return get_conversation(request.json, messages, app.logger)
    else:
        return jsonify({"error": "Invalid request data"}), 400

@app.route("/get-all-messages", methods=['POST'])
def get_all_messages_route():
    if request.json:
        return get_all_messages(request.json, messages, app.logger)
    else:
        return jsonify({"error": "Invalid request data"}), 400

@app.route("/add-to-wallet", methods=['POST'])
def add_to_wallet():
    try:
        data = request.json
        username = data.get('username')
        amount = data.get('amount')
        
        if not username or not amount:
            return jsonify({"error": "Username and amount are required"}), 400
        
        result = users.update_one(
            {"username": username},
            {"$inc": {"wallet": amount}}
        )
        
        if result.modified_count == 1:
            return jsonify({"message": f"Successfully added {amount} to {username}'s wallet"}), 200
        else:
            return jsonify({"error": "Failed to update wallet"}), 500
    except Exception as e:
        app.logger.error(f"Error adding to wallet: {str(e)}")
        return jsonify({"error": "An error occurred while adding to wallet"}), 500

@https_fn.on_request()
def database(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()