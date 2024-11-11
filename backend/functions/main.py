from firebase_admin import initialize_app, storage
from firebase_functions import https_fn
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson import json_util, ObjectId
import json
import base64
from uuid import uuid4
import traceback
import hashlib
import pandas as pd

load_dotenv()
MONGODB_URI = "mongodb+srv://Project1:Radhika@cluster.urbb9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster&tls=true&tlsAllowInvalidCertificates=true"
client = MongoClient(MONGODB_URI)

initialize_app()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

try:
    database = client.get_database("Users")
    collection = database.get_collection("Users")
    organisation_collection = database.get_collection("Organisation")
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

        user = collection.find_one({"username": username})
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
        collection.update_one({"username": username}, {"$push": {"portfolioItems": portfolio}})

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
        user = collection.find_one({"username": username})
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
        result = collection.update_one(
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
        result = collection.update_one(
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
        result = collection.update_one(
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
        cursor = collection.find({})
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
        result = collection.insert_one(data)
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

        user = collection.find_one({"username": username})
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
        results = list(collection.aggregate(pipeline))

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

        user = collection.find_one({"username": username, "email": email})
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

# @app.route('/register_org', methods=['POST'])
# def register_org():
#     """
#     curl -X POST http://127.0.0.1:5000/register_org \
#     -F "orgName=Test Organization" \
#     -F "orgUsername=test_org" \
#     -F "contactNumber=1234567890" \
#     -F "email=test@example.com" \
#     -F "excelFile=@/path/to/your/excel_file.xlsx" \
#     -F "logo=$(base64 -w 0 /path/to/your/logo.jpg)"

#         Response:
#     {   
#     "message": "organization registered successfully"
#     }
#     """
#     org_name = request.form.get('orgName')
#     org_username = request.form.get('orgUsername')
#     contact_number = request.form.get('contactNumber')
#     email = request.form.get('email')
    
#     existing_org = organization_collection.find_one({"orgUsername": org_username})
#     if existing_org:
#         return jsonify({"message": "organization with this username already exists"}), 400

#     user_records = []  
    
#     if 'excelFile' in request.files:
#         file = request.files['excelFile']
#         try:
#             df = pd.read_excel(file)
#             user_records = df.to_dict(orient='records')  
#         except Exception as e:
#             app.logger.error(f"Error processing Excel file: {str(e)}")
#             return jsonify({"message": "Failed to process Excel file"}), 500
#     else:
#         return jsonify({"message": "No Excel file uploaded"}), 400

#     logo_url = None
#     if 'logo' in request.form:
#         logo_data = request.form.get('logo')
#         logo_url = upload_image(logo_data)
#         if not logo_url:
#             return jsonify({"message": "Failed to upload logo image"}), 500

#     org_data = {
#         "orgName": org_name,
#         "orgUsername": org_username,
#         "contactNumber": contact_number,
#         "email": email,
#         "userRecords": user_records,  
#         "logoUrl": logo_url          
#     }
#     organization_collection.insert_one(org_data)
    
#     return jsonify({"message": "Organisation registered successfully"}), 201

@app.route('/register_org', methods=['POST'])
def register_org():
    org_name = request.form.get('orgName')
    org_username = request.form.get('orgUsername')
    org_password = request.form.get('orgPassword')
    contact_number = request.form.get('contactNumber')
    email = request.form.get('email')

    # Check if organization username already exists
    existing_org = organisation_collection.find_one({"orgUsername": org_username})
    if existing_org:
        return jsonify({"message": "Organisation with this username already exists"}), 400

    # Process Excel file if provided
    if 'excelFile' in request.files:
        file = request.files['excelFile']
        try:
            # Load the Excel file into a DataFrame
            df = pd.read_excel(file)
            user_records = df.to_dict(orient='records')
            usernames = []
            # Insert each row into collection as a separate document
            for user in user_records:
                # Separate education fields
                usernames.append(user["username"])
                education = {
                    "degree": user.pop("education_degree", None),
                    "institution": user.pop("education_institution", None),
                    "field_of_study": user.pop("education_field_of_study", None)
                }
                # Only add education if it has non-null values
                if any(education.values()):
                    user["education"] = education

                # # Separate work experience fields
                work_experience = {
                    "company": user.pop("work_experience_company", None),
                    "location": user.pop("work_experience_location", None),
                    "from": user.pop("work_experience_from", None),
                    "to": user.pop("work_experience_to", None),
                    "description": user.pop("work_experience_description", None)
                }
                # Only add work_experience if it has non-null values
                if any(work_experience.values()):
                    user["work_experience"] = work_experience

                # Include organization association
                user_data = {
                    "orgName": org_name,
                    **user
                }
                collection.insert_one(user_data)
        except Exception as e:
            app.logger.error(f"Error processing Excel file: {str(e)}")
            return jsonify({"message": "Failed to process Excel file"}), 500
    else:
        return jsonify({"message": "No Excel file uploaded"}), 400

    # # Process logo if provided
    # logo_url = None
    # if 'logo' in request.form:
    #     logo_data = request.form.get('logo')
    #     logo_url = upload_image(logo_data)
    #     if not logo_url:
    #         return jsonify({"message": "Failed to upload logo image"}), 500

    # Insert organization data into MongoDB
    org_data = {
        "orgName": org_name,
        "orgUsername": org_username,
        "orgPassword": org_password,
        "contactNumber": contact_number,
        "email": email,
        "usernames": usernames
        # "logoUrl": logo_url
    }
    organisation_collection.insert_one(org_data)

    return jsonify({"message": "Organisation registered successfully and users added"}), 201

@app.route('/login_org', methods=['POST'])
def login_org():
    """
    curl -X POST http://localhost:5000/login \
    -H "Content-Type: application/json" \
    -d '{
      "username": "exampleUsername",
      "email": "example@example.com",
      "password": "examplePassword"
    }'

    {
      "message": "Login successful"
    }
    """
    try:
        data = request.get_json()
        print(data)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        print(username, email, password)

        if not username or not email or not password:
            return jsonify({"error": "Missing credentials"}), 400

        user = organisation_collection.find_one({"orgName": username})
        print(user)
        if user:
            if password == user.get('orgPassword'):
                return jsonify({"message": "Login successful"}), 200
            else:
                return jsonify({"error": "Invalid credentials"}), 401
        else:
            return jsonify({"error": "User does not exist"}), 401

    except PyMongoError as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/get-org-membernames', methods=['POST'])
def get_org_membernames():
    org_name = request.json.get('orgName')
    if not org_name:
        return jsonify({"message": "Organization name is required"}), 400

    organization = organisation_collection.find_one({"orgName": org_name}, {"usernames": 1})

    if not organization or "usernames" not in organization:
        return jsonify({"message": "No members found for this organization"}), 404

    return jsonify({"memberNames": organization["usernames"]}), 200


@https_fn.on_request()
def user(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()