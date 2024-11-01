from datetime import datetime,date
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError
from pymongo import ASCENDING, DESCENDING
from bson import ObjectId
from flask import jsonify
import traceback

def message(data, messages, upload_image, logger):
    
    try:

        sender = data['sender']
        receiver = data['receiver']
        content = data['content']
        content_type = data['contentType']
        timestamp = data['timestamp']

        if content_type == 'image':
            content = upload_image(content)

        conversation = messages.find_one({
            'participants': {'$all': [sender, receiver]}
        })

        if conversation:

            new_serial = len(conversation['messages']) + 1
            new_message = {
                'serial': new_serial,
                'sender': sender,
                'content': content,
                'contentType': content_type,
                'timestamp': timestamp
            }

            result = messages.update_one(
                {'_id': conversation['_id']},
                {
                    '$push': {'messages': new_message},
                    '$set': {
                        'lastMessageTimestamp': timestamp,
                        'updatedAt': timestamp
                    }
                }
            )

            if result.modified_count == 0:
                logger.error("Failed to update existing conversation")
                return jsonify({"error": "Failed to update conversation"}), 500

        else:
            new_conversation = {
                'participants': [sender, receiver],
                'lastMessageTimestamp': timestamp,
                'messages': [{
                    'serial': 1,
                    'sender': sender,
                    'content': content,
                    'contentType': content_type,
                    'timestamp': timestamp
                }],
                'createdAt': timestamp,
                'updatedAt': timestamp
            }

            result = messages.insert_one(new_conversation)

            if not result.inserted_id:
                logger.error("Failed to create new conversation")
                return jsonify({"error": "Failed to create new conversation"}), 500

        return jsonify({"success": True, "message": "Message sent successfully"}), 200

    except PyMongoError as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

def get_conversation(data, messages, logger):
    try:
        sender = data['sender']
        receiver = data['receiver']

        conversation = messages.find_one({
            'participants': {'$all': [sender, receiver]}
        })

        if not conversation:
            return jsonify({"error": "Conversation not found"}), 404

        convo_messages = conversation['messages']

        response = {
            "sender": sender,
            "receiver": receiver,
            "messages": [
                {
                    "sender": msg['sender'],
                    "content": msg['content'],
                    "contentType": msg['contentType'],
                    "timestamp": msg['timestamp']
                } for msg in convo_messages
            ]
        }

        return jsonify(response), 200

    except PyMongoError as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500   


def get_all_messages(data, messages, logger):
    try:
        username = data['username']

        conversations = messages.find({'participants': username})

        result = []
        for convo in conversations:
            other_participant = next(user for user in convo['participants'] if user != username)

            last_message = convo['messages'][-1] if convo['messages'] else None

            if last_message:
                conversation_summary = {
                    'sender': username,
                    'receiver': other_participant,
                    'lastMessage': {
                        'sender': last_message['sender'],
                        'receiver': other_participant if last_message['sender'] == username else username,
                        'content': last_message['content'],
                        'contentType': last_message['contentType'],
                        'timestamp': last_message['timestamp']
                    }
                }
                result.append(conversation_summary)

        return jsonify({"conversations": result}), 200

    except PyMongoError as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500
    