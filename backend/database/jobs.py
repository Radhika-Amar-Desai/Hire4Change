from datetime import datetime,date
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError
from pymongo import ASCENDING, DESCENDING
from bson import ObjectId
from flask import jsonify
import traceback

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

def calculate_duration(from_date, to_date):
    from_datetime = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
    to_datetime = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
    duration = to_datetime - from_datetime
    
    days = duration.days
    hours, remainder = divmod(duration.seconds, 3600)
    minutes, _ = divmod(remainder, 60)
    
    if days > 0:
        return f"{days} day{'s' if days > 1 else ''}"
    elif hours > 0:
        return f"{hours} hour{'s' if hours > 1 else ''}"
    else:
        return f"{minutes} minute{'s' if minutes > 1 else ''}"

def fetch_job(job_id, collection, logger):
    try:
        obj_id = ObjectId(job_id)
        job = collection.find_one_and_update(
            {"_id": obj_id},
            {"$inc": {"views": 1}},
            return_document=True
        )
        
        if job:
            job['_id'] = str(job['_id'])
            for key in ['postedDate', 'lastModifiedDate', 'fromDateTime', 'toDateTime']:
                if key in job and isinstance(job[key], datetime):
                    job[key] = job[key].isoformat()
            
            return jsonify(serialize(job)), 200
        else:
            return jsonify({"error": "Job not found"}), 404
        
    except InvalidId:
        return jsonify({"error": "Invalid job ID format"}), 400
    except PyMongoError as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


def create_job(data, users, jobs, upload_image, logger):
    try:
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        publisher = data.get('publisher')
        if not publisher:
            return jsonify({"error": "Publisher username is required"}), 400

        if 'images' in data:
            image_urls = []
            for img_data in data['images']:
                image_url = upload_image(img_data['image'])
                if isinstance(image_url, str) and image_url.startswith('http'):
                    image_urls.append(image_url)
                else:
                    logger.error(f"Failed to upload image: {image_url}")
            data['images'] = image_urls
        
        from_date = data.get('fromDateTime')
        to_date = data.get('toDateTime')
        if from_date and to_date:
            data['estimatedDuration'] = calculate_duration(from_date, to_date)
        
        current_date = datetime.utcnow()
        data.update({
            'status': 'open',
            'assigned': None,
            'postedDate': current_date,
            'savedPosts': 0,
            'lastModifiedDate': current_date,
            'views': 0
        }) 

        # Insert the new job
        result = jobs.insert_one(data)
        
        if result.inserted_id:
            job_id = str(result.inserted_id)
            job_title = data.get('title', 'Untitled Job')

            # Update the user's postedJobs array
            user_update_result = users.update_one(
                {"username": publisher},
                {"$push": {"postedJobs": {"jobId": job_id, "jobTitle": job_title}}}
            )

            if user_update_result.modified_count == 1:
                logger.info(f"Job {job_id} added to postedJobs for user {publisher}")
                return jsonify({
                    "message": "Job listing created successfully and added to user's postedJobs",
                    "job_id": job_id
                }), 201
            else:
                logger.warning(f"Failed to update postedJobs for user {publisher}")
                return jsonify({
                    "message": "Job listing created successfully, but failed to update user's postedJobs",
                    "job_id": job_id
                }), 201
        else:
            return jsonify({"error": "Failed to create job listing"}), 500
        
    except PyMongoError as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


def search_jobs(data, collection, logger):
    try:
        query = data.get('query', '')
        filters = data.get('filters', {})
        sort_by = data.get('sort_by', 'postedDate')
        sort_order = data.get('sort_order', 'desc')

        # Start with an empty pipeline
        pipeline = []

        # If there's a query or any filters, add a $match stage
        if query or filters:
            match_stage = {"$match": {}}

            if query:
                match_stage["$match"]["$or"] = [
                    {"title": {"$regex": query, "$options": "i"}},
                    {"description": {"$regex": query, "$options": "i"}},
                    {"keywords": {"$regex": query, "$options": "i"}}
                ]

            if filters.get('city'):
                match_stage["$match"]["location.city"] = {"$regex": filters['city'], "$options": "i"}
            
            if filters.get('min_price'):
                match_stage["$match"]["priceQuote.amount"] = {"$gte": filters['min_price']}
            
            if filters.get('max_price'):
                match_stage["$match"].setdefault("priceQuote.amount", {})
                match_stage["$match"]["priceQuote.amount"]["$lte"] = filters['max_price']

            pipeline.append(match_stage)

        # Add sorting
        pipeline.append({"$sort": {sort_by: DESCENDING if sort_order == 'desc' else ASCENDING}})

        # Limit the number of results (optional, remove if you want all results)
        pipeline.append({"$limit": 100})

        # Execute the search
        results = list(collection.aggregate(pipeline))

        # Convert ObjectId to string for each document
        for job in results:
            if '_id' in job:
                job['_id'] = str(job['_id'])
            
            # Handle ObjectId in 'applicants' field if it exists
            if 'applicants' in job and isinstance(job['applicants'], list):
                job['applicants'] = [str(applicant) if isinstance(applicant, ObjectId) else applicant for applicant in job['applicants']]

        return jsonify({"results": serialize(results)}), 200

    except PyMongoError as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500



def apply_job(data, jobs_collection, users_collection, logger):
    try:
        applicant_username = data.get('applicantUsername')
        job_id = data.get('jobID')

        if not applicant_username or not job_id:
            return jsonify({"error": "Missing applicantUsername or jobID"}), 400

        job_object_id = ObjectId(job_id)

        job = jobs_collection.find_one({"_id": job_object_id})
        if not job:
            return jsonify({"error": "Job not found"}), 404

        if job.get('status') != 'open':
            return jsonify({"error": "Job has already been assigned or completed. You can no longer apply."}), 400

        if applicant_username in job.get('applicants', []):
            return jsonify({"error": "You have already applied for this job"}), 400

        result = jobs_collection.update_one(
            {"_id": job_object_id, "status": "open"},
            {"$addToSet": {"applicants": applicant_username}}
        )

        if result.modified_count == 1:
            logger.info(f"User {applicant_username} successfully applied for job {job_id}")

            # Add job to user's savedJobs
            saved_job = {
                "jobId": str(job_object_id),
                "jobTitle": job.get('title', 'Untitled Job')
            }

            user_update_result = users_collection.update_one(
                {"username": applicant_username},
                {"$addToSet": {"savedJobs": saved_job}}
            )

            if user_update_result.modified_count == 1:
                logger.info(f"Job {job_id} added to savedJobs for user {applicant_username}")
                return jsonify({"message": "Application submitted successfully and job saved"}), 200
            else:
                logger.warning(f"Failed to add job {job_id} to savedJobs for user {applicant_username}")
                return jsonify({"message": "Application submitted successfully, but failed to save job"}), 200
        else:
            logger.warning(f"Failed to update job {job_id} for applicant {applicant_username}")
            return jsonify({"error": "Failed to submit application. The job may no longer be open."}), 400

    except PyMongoError as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


def assign_jobs(data, users, jobs, transactions, logger):
    try:
        user_id = data.get('userId')
        job_id = data.get('jobId')

        if not user_id or not job_id:
            return jsonify({"error": "Missing userId or jobId"}), 400

        job_object_id = ObjectId(job_id)

        job = jobs.find_one({"_id": job_object_id})
        if not job:
            return jsonify({"error": "Job not found"}), 404

        if job['status'] != 'open':
            return jsonify({"error": "Job is not open for assignment"}), 400

        # Check if employer has sufficient funds
        employer = users.find_one({"username": job['publisher']})
        job_amount = job['priceQuote']['amount']
        if employer['wallet'] < job_amount:
            return jsonify({"error": "Insufficient funds in employer's wallet"}), 400

        # Deduct amount from employer's wallet
        users.update_one(
            {"username": job['publisher']},
            {"$inc": {"wallet": -job_amount}}
        )

        # Create transaction
        transaction = {
            "jobId": str(job_object_id),
            "employer": job['publisher'],
            "employee": user_id,
            "amount": job_amount,
            "status": "held",
            "createdAt": datetime.utcnow()
        }
        transactions.insert_one(transaction)

        # Update job status
        job_update_result = jobs.update_one(
            {"_id": job_object_id},
            {
                "$set": {
                    "status": "assigned",
                    "assigned": user_id
                }
            }
        )

        if job_update_result.modified_count != 1:
            # Rollback the wallet deduction and delete the transaction if job update fails
            users.update_one(
                {"username": job['publisher']},
                {"$inc": {"wallet": job_amount}}
            )
            transactions.delete_one({"jobId": str(job_object_id)})
            return jsonify({"error": "Failed to update job status"}), 500

        active_job_data = {
            "jobId": str(job_object_id),
            "jobTitle": job['title']
        }

        user_update_result = users.update_one(
            {"username": user_id},
            {"$push": {"activeJobs": active_job_data}}
        )

        if user_update_result.modified_count != 1:
            # Rollback all changes if user update fails
            jobs.update_one(
                {"_id": job_object_id},
                {
                    "$set": {
                        "status": "open",
                        "assigned": None
                    }
                }
            )
            users.update_one(
                {"username": job['publisher']},
                {"$inc": {"wallet": job_amount}}
            )
            transactions.delete_one({"jobId": str(job_object_id)})
            return jsonify({"error": "Failed to update user's active jobs"}), 500

        logger.info(f"Job {job_id} successfully assigned to user {user_id}")
        return jsonify({"message": "Job assigned successfully"}), 200

    except PyMongoError as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500



def complete_job(data, users, jobs, transactions, logger):
    try:
        job_id = data.get('jobId')
        if not job_id:
            return jsonify({"error": "Missing jobId"}), 400

        job_object_id = ObjectId(job_id)

        job = jobs.find_one({"_id": job_object_id})
        if not job:
            return jsonify({"error": "Job not found"}), 404

        if job['status'] == 'open':
            return jsonify({"error": "Job has not been assigned to anyone"}), 400
        elif job['status'] == 'completed':
            return jsonify({"error": "Job is already completed"}), 400
        elif job['status'] != 'assigned':
            return jsonify({"error": f"Invalid job status: {job['status']}"}), 400

        assigned_user = job['assigned']

        # Find the transaction for this job
        transaction = transactions.find_one({"jobId": str(job_object_id)})
        if not transaction:
            return jsonify({"error": "No transaction found for this job"}), 404

        # Update transaction status
        transactions.update_one(
            {"jobId": str(job_object_id)},
            {"$set": {"status": "completed"}}
        )

        # Transfer money to employee's wallet
        users.update_one(
            {"username": assigned_user},
            {"$inc": {"wallet": transaction['amount']}}
        )

        job_update_result = jobs.update_one(
            {"_id": job_object_id},
            {"$set": {"status": "completed"}}
        )

        if job_update_result.modified_count != 1:
            return jsonify({"error": "Failed to update job status"}), 500

        job_data = {
            "jobId": str(job_object_id),
            "jobTitle": job['title']
        }

        user_update_result = users.update_one(
            {"username": assigned_user},
            {
                "$pull": {"activeJobs": job_data},
                "$push": {"completedJobs": job_data}
            }
        )

        if user_update_result.modified_count != 1:
            jobs.update_one(
                {"_id": job_object_id},
                {"$set": {"status": "assigned"}}
            )
            return jsonify({"error": "Failed to update user's job lists"}), 500

        logger.info(f"Job {job_id} successfully marked as completed for user {assigned_user}")
        return jsonify({"message": "Job marked as completed successfully"}), 200

    except PyMongoError as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

def posted_jobs(data, users, logger):
    try:
        username = data.get('username')
        
        if not username:
            return jsonify({"error": "Username is required"}), 400

        user = users.find_one({"username": username})
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        posted_jobs = user.get('postedJobs', [])

        return jsonify({
            "message": "posted jobs retrieved successfully",
            "postedJobs": posted_jobs
        }), 200

    except PyMongoError as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


