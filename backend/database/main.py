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
import hashlib
import base64
from uuid import uuid4 
import traceback
from bson import ObjectId
from bson.errors import InvalidId
from jobs import fetch_job, create_job, search_jobs, apply_job, posted_jobs, assign_jobs, complete_job
from messages import message, get_conversation, get_all_messages 

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")

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

    """
    curl -X GET http://127.0.0.1:5000/fetch-job/<JOB-ID>

Response in JSON:

{
  "_id": "ObjectId",
  "applicants": [
    "ApplicantUsername"
  ],
  "applicationDeadline": "YYYY-MM-DDTHH:MM:SSZ",
  "assigned": "ObjectId",
  "category": "Category",
  "description": "Description",
  "estimatedDuration": "Duration",
  "experienceLevel": "ExperienceLevel",
  "fromDateTime": "YYYY-MM-DDTHH:MM:SSZ",
  "images": [
    "https://example.com/images/image1.jpg",
    "https://example.com/images/image2.jpg"
  ],
  "keywords": [
    "Keyword1",
    "Keyword2",
    "Keyword3"
  ],
  "lastModifiedDate": "YYYY-MM-DDTHH:MM:SSZ",
  "location": {
    "address": "Address",
    "city": "City",
    "coordinates": {
      "coordinates": [
        Longitude,
        Latitude
      ],
      "type": "Point"
    },
    "country": "Country",
    "pincode": "PostalCode",
    "state": "State",
    "street": "Street"
  },
  "postedDate": "YYYY-MM-DDTHH:MM:SSZ",
  "priceQuote": {
    "amount": Amount,
    "currency": "Currency",
    "rateType": "RateType"
  },
  "publisher": "PublisherName",
  "skillsRequired": [
    "Skill1",
    "Skill2",
    "Skill3"
  ],
  "status": "Status",
  "title": "Title",
  "toDateTime": "YYYY-MM-DDTHH:MM:SSZ",
  "type": "Type",
  "views": ViewsCount
}
"""

    return fetch_job(job_id, collection, app.logger)



@app.route("/create-job-listing", methods=['POST'])
def create_job_route():

    """
curl -X POST http://localhost:5000/create-job-listing \
-H "Content-Type: application/json" \
-d '{
  "publisher": "job publisher",
  "title": "job title",
  "description": "job description",
  "category": "job category",
  "fromDateTime": "start date and time in ISO 8601 format",
  "toDateTime": "end date and time in ISO 8601 format",
  "location": {
    "address": "street address",
    "city": "city",
    "state": "state or province",
    "country": "country",
    "pincode": "postal code"
  },
  "priceQuote": {
    "amount": "price amount",
    "currency": "currency code (e.g., INR)",
    "rateType": "type of rate (e.g., fixed)"
  },
  "skillsRequired": [
    "skills required for the job"
  ],
  "keywords": [
    "keywords associated with the job"
  ],
  "applicationDeadline": "application deadline in ISO 8601 format"
}'

Returned Response:

{
  "job_id": "672279df25e5f84b050c2e08",
  "message": "Job listing created successfully, but failed to update user's postedJobs"
}

"""

    return create_job(request.json, users,collection, upload_image, app.logger)



@app.route("/search-job-listing", methods=['POST'])
def search_job_route():
     """
     curl -X POST http://localhost:5000/search-job-listing -H "Content-Type: application/json" -d '{
  "query": "search keyword",
  "filters": {
    "city": "city name",
    "min_price": "minimum price",
    "max_price": "maximum price"
  },
  "sort_by": "sorting field (e.g., postedDate)",
  "sort_order": "sorting order (asc or desc)"
}'

Response:

{
  "results": [
    {
      "_id": "job id",
      "applicants": [
        "list of applicants"
      ],
      "applicationDeadline": "application deadline in ISO 8601 format",
      "assigned": "assigned user id or null",
      "category": "job category",
      "description": "job description",
      "estimatedDuration": "estimated duration of the job",
      "experienceLevel": "required experience level",
      "fromDateTime": "start date and time in ISO 8601 format",
      "images": [
        "list of image URLs"
      ],
      "keywords": [
        "list of keywords related to the job"
      ],
      "lastModifiedDate": "last modified date in ISO 8601 format",
      "location": {
        "address": "street address",
        "city": "city name",
        "coordinates": {
          "coordinates": [
            "longitude",
            "latitude"
          ],
          "type": "Point"
        },
        "country": "country name",
        "pincode": "postal code",
        "state": "state or province",
        "street": "street name"
      },
      "postedDate": "posted date in ISO 8601 format",
      "priceQuote": {
        "amount": "price amount",
        "currency": "currency code (e.g., INR)",
        "rateType": "rate type (e.g., fixed)"
      },
      "publisher": "publisher username",
      "skillsRequired": [
        "list of required skills"
      ],
      "status": "current status of the job",
      "title": "job title",
      "toDateTime": "end date and time in ISO 8601 format",
      "type": "job type (e.g., on-site)",
      "views": "number of views"
    }
  ]
}
     """

     return search_jobs(request.json,collection,app.logger)

@app.route("/apply-job", methods=['POST'])
def apply_job_route():

    """
    curl -X POST http://localhost:5000/apply-job -H "Content-Type: application/json" -d '{
    "applicantUsername": "Radhika",
    "jobID": "672279df25e5f84b050c2e08"
}'
{
  "message": "Application submitted successfully and job saved"
}


    Request:
    {
  "applicantUsername": "applicant's username",
  "jobID": "job ID to apply to"
    }

    Response:

    {
  "message": "confirmation message indicating the application status"
    }


    """

    return apply_job(request.json, collection, users, app.logger)

@app.route("/posted-jobs",methods=['POST'])
def posted_jobs_route():

    """
    {
  "message": "confirmation message indicating successful retrieval",
  "postedJobs": [
    {
      "_id": "job id",
      "applicants": [
        "list of applicants"
      ],
      "applicationDeadline": "application deadline in ISO 8601 format",
      "assigned": "assigned user id or null",
      "category": "job category",
      "description": "job description",
      "estimatedDuration": "estimated duration of the job",
      "experienceLevel": "required experience level",
      "fromDateTime": "start date and time in ISO 8601 format",
      "images": [
        "list of image URLs"
      ],
      "keywords": [
        "list of keywords related to the job"
      ],
      "lastModifiedDate": "last modified date in ISO 8601 format",
      "location": {
        "address": "street address",
        "city": "city name",
        "coordinates": {
          "coordinates": [
            "longitude",
            "latitude"
          ],
          "type": "Point"
        },
        "country": "country name",
        "pincode": "postal code",
        "state": "state or province",
        "street": "street name"
      },
      "postedDate": "posted date in ISO 8601 format",
      "priceQuote": {
        "amount": "price amount",
        "currency": "currency code (e.g., INR)",
        "rateType": "rate type (e.g., fixed)"
      },
      "publisher": "publisher username",
      "skillsRequired": [
        "list of required skills"
      ],
      "status": "current status of the job",
      "title": "job title",
      "toDateTime": "end date and time in ISO 8601 format",
      "type": "job type (e.g., on-site)",
      "views": "number of views"
    }
  ]
}

    """

    return posted_jobs(request.json,users,app.logger)


@app.route("/assign-job", methods=['POST'])
def assign_job_route():
    """
    curl -X POST http://localhost:8000/assign-job \
  -H "Content-Type: application/json" \
  -d '{
     "userId": "your_user_id", 
     "jobId": "your_job_id"
  }'

  Response:
  {
  "message": "Job assigned successfully"
  }

    """
    return assign_jobs(request.json, users, collection, transactions, app.logger)

@app.route("/complete-job", methods=['POST'])
def complete_jobs_route():
    """
    curl -X POST http://localhost:5000/complete-job -H "Content-Type: application/json" -d '{
    "jobId": "JOB ID"
  }'

  Response:
  {
   "message": "Job has been assigned"
  }

    """
    return complete_job(request.json, users, collection, transactions, app.logger)


# Messagin
@app.route("/message", methods=['POST'])
def message_route():
    """
    curl -X POST http://localhost:5000/complete-job -H "Content-Type: application/json" -d
      '{
        "sender": "Sender Username",       
        "receiver": "Receiver Username",   
        "content": "Message Content",       
        "contentType": "text|image",        
        "timestamp": "YYYY-MM-DDTHH:MM:SSZ" 
    }'
    """
    if request.json:
        return message(request.json, messages, upload_image, app.logger)
    else:
        return jsonify({"error": "Invalid request data"}), 400


@app.route("/get-conversation", methods=['POST'])
def get_conversation_route():
    
    """
      curl -X POST http://localhost:5000/get-conversation -H "Content-Type: application/json" -d '{
    "sender": "Sender Username",    
      "receiver": "Receiver Username" 
    }'

    Response:

        {
    "messages": [
      {
        "content": "Message Content",
        "contentType": "Content Type",
        "sender": "Sender Name",
        "timestamp": "Timestamp Format"
      },
     {
        "content": "Message Content",
        "contentType": "Content Type",
        "sender": "Sender Name",
       "timestamp": "Timestamp Format"
      },
      {
        "content": "Message Content",
        "contentType": "Content Type",
        "sender": "Sender Name",
        "timestamp": "Timestamp Format"
     }
    ],
    "receiver": "Receiver Name",
    "sender": "Sender Name"
    }

    """

    if request.json:
        return get_conversation(request.json, messages, app.logger)
    else:
        return jsonify({"error": "Invalid request data"}), 400

@app.route("/get-all-messages", methods=['POST'])
def get_all_messages_route():
    
    """
      curl -X POST http://localhost:5000/get-all-messages -H "Content-Type: application/json" -d '{
    "username": "Username"
}'


    
        Response:

        {
  "conversations": [
    {
      "lastMessage": {
        "content": "Last message content",
        "contentType": "Content type of the message",
        "receiver": "Receiver name",
        "sender": "Sender name",
        "timestamp": "Timestamp of the last message"
      },
      "receiver": "Receiver name",
      "sender": "Sender name"
    },
    {
      "lastMessage": {
        "content": "Last message content",
        "contentType": "Content type of the message",
        "receiver": "Receiver identifier",
        "sender": "Sender name",
        "timestamp": "Timestamp of the last message"
      },
      "receiver": "Receiver identifier",
      "sender": "Sender name"
    }
  ]
}
    
    """
    if request.json:
        return get_all_messages(request.json, messages, app.logger)
    else:
        return jsonify({"error": "Invalid request data"}), 400


@app.route("/add-to-wallet", methods=['POST'])
def add_to_wallet():
    
    """
    curl -X POST http://localhost:5000/add-to-wallet \
  -H "Content-Type: application/json" \
  -d '{
        "username": "Username",
        "amount": 100
      }'

    Response:

    {
  "message": "Successfully added 100 to Radhika123's wallet"
    }

    """

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



def serialize(data):
    """Recursively converts ObjectId fields to strings in a given dictionary."""
    if isinstance(data, dict):
        return {key: serialize(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [serialize(item) for item in data]
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data

@app.route("/profile", methods=['GET'])
def profile():
    try:
        username = request.args.get('username')
        if not username:
            return jsonify({"error": "No username provided"}), 400

        user = users.find_one({"username": username})
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_data = {
            "username": user.get("username"),
            "email": user.get("email"),
            "phoneNumber": user.get("phoneNumber"),
            "bio": user.get("bio"),
            "skills": user.get("skills", []),
            "languages": user.get("languages", []),
            "profilePictureUrl": user.get("profilePictureUrl"),  # Assuming you store the profile picture URL
            "reviews": list(map(serialize,user.get("reviews",[]))),
            "ratings": user.get("ratings", {}),
            "workExperience": user.get("workExperience", []),
            "education": user.get("education", []),
            "portfolioItems": user.get("portfolioItems", []),
            "activeJobs":list(map(serialize,user.get("activeJobs",[]))),
            "completedJobs":list(map(serialize,user.get("completedJobs",[]))),
            "savedJobs": list(map(serialize,user.get("savedJobs",[]))),
            "postedJobs": list(map(serialize,user.get("postedJobs",[])))
        }

        return jsonify(user_data), 200
    except PyMongoError as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


@app.route("/add-portfolio", methods=['POST'])
def add_portfolio():
    try:
        data = request.json
        username = data.get('username')
        if not username:
            return jsonify({"error": "No username provided"}), 400

        portfolio = {
            "title": data.get('title'),
            "description": data.get('description'),
            "images": data.get('images', []),
            "link": data.get('link')
        }

        # Update the user's portfolio in the database
        users.update_one({"username": username}, {"$push": {"portfolioItems": portfolio}})

        return jsonify({"message": "Portfolio updated successfully!"}), 200
    except PyMongoError as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


@app.route("/add-work-experience", methods=['POST'])
def add_work_experience():
    try:
        data = request.json
        username = data.get('username')
        if not username:
            return jsonify({"error": "No username provided"}), 400

        # Find the user and get the current length of the work_experience array
        user = users.find_one({"username": username})
        if not user:
            return jsonify({"error": "User not found"}), 404

        work_experience_list = user.get("work_experience", [])
        current_length = len(work_experience_list)

        # Generate a unique ID based on the current length of the work_experience array
        unique_id = hashlib.sha256(str(current_length).encode()).hexdigest()

        work_experience = {
            "id": unique_id,  # Unique ID based on array length
            "title": data.get('title'),
            "company": data.get('company'),
            "location": data.get('location'),
            "from": data.get('from'),
            "to": data.get('to'),
            "description": data.get('description')
        }

        # Add the new work experience to the user's work_experience array in the database
        result = users.update_one(
            {"username": username},
            {"$push": {"work_experience": work_experience}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"message": "Work experience added successfully!"}), 200
    except PyMongoError as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route("/delete-work-experience", methods=['DELETE'])
def delete_work_experience():
    try:
        data = request.json
        username = data.get('username')
        experience_id = data.get('id')

        if not username or not experience_id:
            return jsonify({"error": "Username or work experience ID not provided"}), 400

        # Remove the work experience with the matching ID from the array
        result = users.update_one(
            {"username": username},
            {"$pull": {"work_experience": {"id": experience_id}}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "User or work experience not found"}), 404

        return jsonify({"message": "Work experience deleted successfully!"}), 200
    except PyMongoError as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route("/update-work-experience", methods=['POST'])
def update_work_experience():
    try:
        data = request.json
        username = data.get('username')
        experience_id = data.get('id')

        if not username or not experience_id:
            return jsonify({"error": "Username or work experience ID not provided"}), 400

        # Create a dictionary with the fields to be updated
        updated_experience = {}
        if data.get('title'):
            updated_experience['work_experience.$.title'] = data.get('title')
        if data.get('company'):
            updated_experience['work_experience.$.company'] = data.get('company')
        if data.get('location'):
            updated_experience['work_experience.$.location'] = data.get('location')
        if data.get('from'):
            updated_experience['work_experience.$.from'] = data.get('from')
        if data.get('to'):
            updated_experience['work_experience.$.to'] = data.get('to')
        if data.get('description'):
            updated_experience['work_experience.$.description'] = data.get('description')

        # Update the specific work experience in the array
        result = users.update_one(
            {"username": username, "work_experience.id": experience_id},
            {"$set": updated_experience}
        )

        if result.matched_count == 0:
            return jsonify({"error": "User or work experience not found"}), 404

        return jsonify({"message": "Work experience updated successfully!"}), 200
    except PyMongoError as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


@app.route("/get-data", methods=['GET'])
def get_data():
    try:
        cursor = users.find({})
        data = list(cursor)
        if not data:
            return jsonify({"error": "No data found"}), 404
        return json.loads(json_util.dumps(data))
    except PyMongoError as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route("/add-data", methods=['POST'])
def add_data():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        data.setdefault('work_experience', [])
        data.setdefault('portfolioItems', [])
        data.setdefault('ratings', {'asEmployer': 0, 'asFreelancer': 0})
        data.setdefault('completedJobs', [])
        data.setdefault('reviews',[])
        data.setdefault('activeJobs', [])
        data.setdefault('savedJobs', [])
        data.setdefault('postedJobs', [])
        data.setdefault('profilePicture', '')
        data.setdefault('bio', '')
        data.setdefault('skills', [])
        data.setdefault('languages', [])
        data.setdefault('education', [])
        data.setdefault('createdAt', '')
        data.setdefault('lastActive', '')
        data.setdefault('isVerified', False)
        data.setdefault('verificationDocuments', [])

        current_date = datetime.now().isoformat()
        data['server_date'] = current_date
        result = users.insert_one(data)
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

@app.route("/check-username", methods=['GET'])
def check_username():
    try:
        username = request.args.get('username')
        if not username:
            return jsonify({"error": "No username provided"}), 400

        user = users.find_one({"username": username})
        exists = user is not None

        return jsonify({"exists": exists}), 200
    except PyMongoError as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route("/search_users",methods=["POST"])
def search_users_route():
    data=request.json
    try:
        query = data.get('query', '')
        filters = data.get('filters', {})
        sort_by = data.get('sort_by', 'ratings.asFreelancer')
        sort_order = data.get('sort_order', 'desc')

        pipeline = []

        # Search stage
        if query:
            pipeline.append({
                "$search": {
                    "index": "default",  # Make sure this matches your actual index name
                    "text": {
                        "query": query,
                        "path": ["username", "bio", "skills", "location.city", "education.institution", "education.degree", "education.fieldOfStudy", "workExperience.title", "workExperience.description"],
                        "fuzzy": {
                            "maxEdits": 2,
                            "prefixLength": 3
                        }
                    }
                }
            })
        else:
            # If no query, match all documents
            pipeline.append({"$match": {}})

        # Filter stage
        match_stage = {"$match": {}}

        if filters.get('city'):
            match_stage["$match"]["location.city"] = {"$regex": filters['city'], "$options": "i"}
        
        if filters.get('min_rating'):
            match_stage["$match"]["ratings.asFreelancer"] = {"$gte": float(filters['min_rating'])}
        
        if filters.get('skills'):
            skills = [skill.strip() for skill in filters['skills'].split(',')]
            match_stage["$match"]["skills"] = {"$in": skills}

        if match_stage["$match"]:
            pipeline.append(match_stage)

        # Sorting stage
        sort_direction = -1 if sort_order == 'desc' else 1
        pipeline.append({"$sort": {sort_by: sort_direction}})

        # Limit results (optional)
        pipeline.append({"$limit": 100})

        # Execute the pipeline
        results = list(users.aggregate(pipeline))

        # Convert ObjectId to string for each document
        for user in results:
            if '_id' in user:
                user['_id'] = str(user['_id'])

        # Log the number of results and the first result for debugging
        app.logger.info(f"Number of results: {len(results)}")
        if results:
            app.logger.info(f"First result: {results[0]}")
        else:
            app.logger.info("No results found")

        return jsonify({"results": results}), 200

    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route("/add-image", methods=['POST'])
def append_image():
    try:
        data = request.json
        if not data or 'images' not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        uploaded_urls = []
        for image_obj in data['images']:
            if 'image' not in image_obj:
                continue
            url = upload_image(image_obj['image'])
            if url:
                uploaded_urls.append(url)
        
        if not uploaded_urls:
            return jsonify({"error": "Failed to upload any images"}), 500
        
        return jsonify({"urls": uploaded_urls}), 201
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        app.logger.error(traceback.format_exc())  # Log the full traceback
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

@app.route("/login", methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return jsonify({"error": "Missing credentials"}), 400

        user = users.find_one({"username": username, "email": email})
        if user and user.get('password') == password:
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"error": "Invalid credentials or user does not exist"}), 401

    except PyMongoError as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500








# @https_fn.on_request()
# def database(req: https_fn.Request) -> https_fn.Response:
#     with app.request_context(req.environ):
#         return app.full_dispatch_request()
if __name__ == "__main__":
    app.run(debug=True)  # Change debug=False in production
