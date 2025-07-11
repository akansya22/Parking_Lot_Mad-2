from .database import db
from .models import User, Role, Parking_Spot, Parking_Lot, Reservation
from flask import current_app as app, jsonify, request, render_template
from flask_security import auth_required, roles_required, roles_accepted, current_user, login_user 
from werkzeug.security import check_password_hash, generate_password_hash 
from .util import roles_list 
from datetime import datetime, timedelta  # Make sure it's imported at the top
from math import ceil  


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')


@app.route('/api/admin')
@auth_required('token') # Authentication
@roles_required('admin') # RBAC/Authorization
def admin_home():
    return jsonify({
        "message" :" Welcome to the Admin Home Page!"
    })


@app.route('/api/home')
@auth_required('token')
@roles_accepted('user', 'admin')
def user_home():
    user = current_user
    return jsonify({
        "username" : user.username,
        "email" : user.email,
        "roles" : roles_list(user.roles)
    })


@app.route('/api/login', methods=['POST'])
def user_login():
    body = request.get_json()
    email = body['email']
    password = body['password']

    if not email:
        return jsonify({
            "message": "Email is required!"
        }), 400

    user = app.security.datastore.find_user(email = email)

    if user:
        if check_password_hash(user.password, password):
            login_user(user)
            print(current_user)
            return jsonify({
                "id": user.id,
                "username": user.username,
                "roles": roles_list(user.roles),
                "auth-token": user.get_auth_token()
            })
        else:
            return jsonify({
                "message": "Incorrect Password"
            }), 400
    else:
        return jsonify({
            "message": "User Not Found"
        }), 404




@app.route('/api/register', methods=['POST'])
def create_user():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email=credentials['email']):
        app.security.datastore.create_user(
            email=credentials['email'],
            username=credentials['username'],
            password=generate_password_hash(credentials['password']),
            roles=['user']
        )
        db.session.commit()
        return jsonify({
            "message": "User created successfully!",
            "success": True
        }), 201

    return jsonify({
        "message": "User already exists!",
        "success": False
    }), 400




@app.route('/api/spot/<int:lot_id>/<int:spot_number>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def delete_spot(lot_id, spot_number):
    spot = Parking_Spot.query.filter_by(lot_id=lot_id, spot_number=spot_number).first()
    if not spot:
        return jsonify({"message": "Spot not found"}), 404

    db.session.delete(spot)
    db.session.commit()

    return jsonify({"message": f"Spot {spot_number} deleted successfully"}), 200









@app.route('/api/book', methods=['POST'])
@auth_required('token')
@roles_accepted('user', 'admin')
def book_spot():
    try:
        data = request.get_json()
        lot_id = data.get("lot_id")
        vehicle_number = data.get("vehicle_number")

        if not lot_id or not vehicle_number:
            return jsonify({"message": "Lot ID and vehicle number are required"}), 400

        spot = Parking_Spot.query.filter_by(lot_id=lot_id, status='A').first()
        if not spot:
            return jsonify({"message": "No available spots"}), 400

        # Update spot
        spot.status = 'O'
        spot.customer_id = current_user.id
        spot.vehicle_number = vehicle_number
        db.session.commit()

        # Create reservation
        reservation = Reservation(
            user_id=current_user.id,
            spot_id=spot.id,
            vehicle_number=vehicle_number,
            lot_name_snapshot=spot.parking_lot.location_name,  # store name
            spot_number_snapshot=spot.spot_number,              # store spot
            parking_timestamp=datetime.utcnow()
        )
        db.session.add(reservation)
        db.session.commit()

        return jsonify({"message": f"Spot {spot.id} reserved successfully!"}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Booking failed", "details": str(e)}), 500









@app.route('/api/user/bookings')
@auth_required('token')
@roles_accepted('user', 'admin')
def user_bookings():
    try:
        reservations = Reservation.query.filter_by(user_id=current_user.id).order_by(Reservation.id.desc()).all()
        result = []

        for r in reservations:
            spot = r.parking_spot
            lot = spot.parking_lot if spot else None
            result.append({
                "id": r.spot_id,
                "lot_name": f"{lot.location_name}" if lot else f"{r.lot_name_snapshot} (Spot No longer available)",
                "spot_number": spot.spot_number if spot else r.spot_number_snapshot,
                "vehicle_number": r.vehicle_number,
                "time": (r.parking_timestamp + timedelta(hours=5, minutes=30)).isoformat(),
                "release_time": (r.leaving_timestamp + timedelta(hours=5, minutes=30)).isoformat() if r.leaving_timestamp else None,
                "released": bool(r.leaving_timestamp),
                "price_per_hour": lot.price if lot else "N/A"
            })


        return jsonify(result), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal error", "details": str(e)}), 500






@app.route('/api/release', methods=['POST'])
@auth_required('token')
@roles_accepted('user', 'admin')
def release_spot():
    try:
        data = request.get_json()
        spot_id = data.get("spot_id")

        spot = Parking_Spot.query.get(spot_id)
        if not spot:
            return jsonify({"message": "Invalid spot ID"}), 404

        reservation = Reservation.query.filter_by(
            spot_id=spot_id, user_id=current_user.id
        ).order_by(Reservation.id.desc()).first()

        if not reservation or reservation.leaving_timestamp:
            return jsonify({"message": "No active reservation found"}), 400

        # Set the release time
        reservation.leaving_timestamp = datetime.utcnow()

                # ⏱️ Calculate duration in hours
        duration = (reservation.leaving_timestamp - reservation.parking_timestamp).total_seconds() / 3600
        duration = max(duration, 0.01)  # Prevent zero duration

        # ⬆️ Round up to nearest full hour
        hours_to_charge = ceil(duration)

        # 💸 Get the lot price
        lot_price = spot.parking_lot.price

        # 🧮 Final cost
        cost = round(hours_to_charge * lot_price, 2)
        reservation.parking_cost = cost


        # Reset the spot
        spot.status = 'A'
        spot.customer_id = None
        spot.vehicle_number = None

        db.session.commit()

        return jsonify({"message": f"Spot released. ₹{cost} charged"}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"message": "Error releasing spot", "error": str(e)}), 500








@app.route('/api/admin/lot-stats')
@auth_required('token')
@roles_required('admin')
def lot_stats():
    try:
        lots = Parking_Lot.query.all()
        result = []

        for lot in lots:
            occupied = Parking_Spot.query.filter_by(lot_id=lot.id, status='O').count()
            available = Parking_Spot.query.filter_by(lot_id=lot.id, status='A').count()
            result.append({
                "location_name": lot.location_name,
                "occupied": occupied,
                "available": available
            })

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500





@app.route('/api/user/parking-summary')
@auth_required('token')
@roles_accepted('user', 'admin')
def user_parking_summary():
    try:
        # Get all reservations by current user, join with parking_lot
        results = db.session.query(
            Parking_Lot.location_name,
            db.func.count(Reservation.id)
        ).join(Parking_Spot, Parking_Lot.id == Parking_Spot.lot_id)\
         .join(Reservation, Parking_Spot.id == Reservation.spot_id)\
         .filter(Reservation.user_id == current_user.id)\
         .group_by(Parking_Lot.location_name)\
         .all()

        # Format the result
        summary = [{"location": row[0], "count": row[1]} for row in results]
        return jsonify(summary), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch parking summary"}), 500
    





@app.route('/api/users')
@auth_required('token')
@roles_required('admin')
def get_users():
    try:
        users = User.query.filter(~User.roles.any(Role.name == 'admin')).all()
        result = []

        for u in users:
            reservations = Reservation.query.filter_by(user_id=u.id).order_by(Reservation.id.desc()).all()
            bookings = []

            for r in reservations:
                if not r.parking_spot or not r.parking_spot.parking_lot:
                    continue  # skip incomplete relationships

                bookings.append({
                    "lot_name": r.parking_spot.parking_lot.location_name,
                    "spot_number": r.parking_spot.spot_number,
                    "vehicle_number": r.vehicle_number,
                    "time": r.parking_timestamp.strftime('%d-%m-%Y %I:%M %p'),
                    "release_time": r.leaving_timestamp.strftime('%d-%m-%Y %I:%M %p') if r.leaving_timestamp else None,
                    "released": bool(r.leaving_timestamp),
                    "amount_paid": r.parking_cost 
                })


            result.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "roles": [role.name for role in u.roles],
                "bookings": bookings
            })

        return jsonify(result), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch users"}), 500
