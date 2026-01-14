from flask import request, jsonify
from database import get_db

db = get_db()


#--------------------------
#DISCOUNT VALIDATOR
#--------------------------
def validate_hypervision_route():

    data = request.json

    hyper_id = str(data.get("hypervision_id", "")).strip()      
    # .strip() : Cleaning step (removes any accidental spaces the user type before and after ID)
    sapid = str(data.get("sapid", "")).strip()


    #Looks for 'hypervision_members' folder in database.
    #VALID and UNIQUE Hypervision id 
    member = db["hypervision_members"].find_one({
        "hypervision_id": hyper_id,
        "sapid": sapid
    })

    if member:
        return jsonify({
            "is_hypervision": True,
            "amount": 380,
            "member": {
                "name": member["name"],
                "email": member["email"],
                "sapid": member["sapid"],
                "phone": member["phone"]
            }
        })

    return jsonify({
        "is_hypervision": False,
        "amount": 450
    })
