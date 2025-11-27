import os
from pymongo import MongoClient
from dotenv import load_dotenv

def get_user_role(email):
    load_dotenv() 
    mongo_uri = "mongodb+srv://yadavshubhamahir26_db_user:Shalini152005@cluster0.x166g0v.mongodb.net/drc-political-science?retryWrites=true&w=majority"
    
    try:
        client = MongoClient(mongo_uri)
        db = client.get_database() 
        users_collection = db.users
        user = users_collection.find_one({"email": email})

        if user:
            print(f"User found: {user['email']}")
            print(f"Role: {user.get('role', 'Role not found or not set')}")
            if user.get('role') != 'admin':
                print("Recommendation: If this user should be an admin, please manually update their 'role' field in the database to 'admin'.")
        else:
            print(f"User with email '{email}' not found.")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if 'client' in locals() and client:
            client.close()

if __name__ == "__main__":
    user_email = "10shubhamyadav@gmail.com"
    get_user_role(user_email)
