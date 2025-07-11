from flask_restful import Api, Resource, reqparse
from .models import *
from flask_security import auth_required, roles_required, roles_accepted, current_user
from .util import roles_list

api = Api()

# Use explicit names matching the actual model fields
parser = reqparse.RequestParser()
parser.add_argument("location_name", required=True)
parser.add_argument("price", type=float, required=True)
parser.add_argument("pin_code", required=True)
parser.add_argument("number_of_spots", type=int, required=True)


class LotApi(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self):
        lots = Parking_Lot.query.all()
        result = []

        for lot in lots:
            # Fetch spots from DB
            spots = Parking_Spot.query.filter_by(lot_id=lot.id).order_by(Parking_Spot.id).all()
            spot_list = [
                {
                    "number": i + 1,
                    "status": spot.status,
                    "lotId": lot.id
                } for i, spot in enumerate(spots)
            ]

            result.append({
                "id": lot.id,
                "location_name": lot.location_name,
                "price": lot.price,
                "pin_code": lot.pin_code,
                "number_of_spots": len(spots),
                "occupied_spots": sum(1 for s in spots if s.status == 'O'),  # ✅ ADD THIS LINE
                "spots": spot_list
            })


        return result, 200



    @auth_required('token')
    @roles_required('admin')
    def post(self):
        data = parser.parse_args()
        location_name = data["location_name"]
        price = data["price"]
        pin_code = data["pin_code"]
        number_of_spots = data["number_of_spots"]

        lot = Parking_Lot(location_name=location_name, price=price,
                          pin_code=pin_code, number_of_spots=number_of_spots)
        db.session.add(lot)
        db.session.commit()

        for _ in range(number_of_spots):
            db.session.add(Parking_Spot(lot_id=lot.id))
        db.session.commit()

        return {"message": "Parking lot created successfully!"}, 201


class LotEditDeleteApi(Resource):
    @auth_required('token')
    @roles_required('admin')
    def put(self, lot_id):
        data = parser.parse_args()
        lot = Parking_Lot.query.get(lot_id)
        if not lot:
            return {"message": "Lot not found"}, 404

        lot.location_name = data.get("location_name") or lot.location_name
        lot.pin_code = data.get("pin_code") or lot.pin_code

        new_price = data.get("price")
        new_spots = data.get("number_of_spots")

        if new_price is not None:
            lot.price = float(new_price)

        if new_spots is not None:
            diff = new_spots - lot.number_of_spots
            lot.number_of_spots = new_spots
            db.session.commit()

            if diff > 0:
                for _ in range(diff):
                    db.session.add(Parking_Spot(lot_id=lot.id))
            elif diff < 0:
                # Only delete if enough available spots
                to_delete = Parking_Spot.query.filter_by(lot_id=lot.id, status='A').limit(abs(diff)).all()
                if len(to_delete) < abs(diff):
                    return {"message": "Can't reduce spots. Not enough available spots."}, 400
                for spot in to_delete:
                    db.session.delete(spot)

            db.session.commit()

        return {"message": "Parking lot updated successfully!"}, 200

    @auth_required('token')
    @roles_required('admin')
    def delete(self, lot_id):
        lot = Parking_Lot.query.get(lot_id)
        if not lot:
            return {"message": "Lot not found"}, 404

        occupied_count = Parking_Spot.query.filter_by(lot_id=lot.id, status='O').count()
        if occupied_count > 0:
            return {"message": "Can't delete. Some spots are occupied."}, 400

        db.session.delete(lot)
        db.session.commit()
        return {"message": "Lot deleted successfully"}, 200


# Cleaner RESTful route structure
api.add_resource(LotApi, "/api/lot")                      # GET (list), POST (create)
api.add_resource(LotEditDeleteApi, "/api/lot/<int:lot_id>")  # PUT, DELETE





class SpotListByLot(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self, lot_id):
        spots = Parking_Spot.query.filter_by(lot_id=lot_id).all()
        return [
            {
                "id": spot.id,
                "status": "Occupied" if spot.status == "O" else "Available"
            } for spot in spots
        ]
api.add_resource(SpotListByLot, "/api/lot/<int:lot_id>/spots")






class SpotDetailsApi(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self, lot_id, spot_number):
        # Get the spot list ordered by ID so spot_number works
        spots = Parking_Spot.query.filter_by(lot_id=lot_id).order_by(Parking_Spot.id).all()
        if not spots or spot_number > len(spots):
            return {"message": "Spot not found"}, 404

        target_spot = spots[spot_number - 1]
        if target_spot.status != 'O':
            return {"message": "Spot is not occupied"}, 400

        # ✅ Get the latest reservation for this spot
        latest_res = Reservation.query.filter_by(spot_id=target_spot.id).order_by(Reservation.parking_timestamp.desc()).first()

        if not latest_res:
            return {"message": "No reservation found"}, 404

        return {
            "spot_id": target_spot.id,
            "customer_id": latest_res.user_id,
            "vehicle_number": latest_res.vehicle_number,
            "date": latest_res.parking_timestamp.strftime("%d/%m/%Y"),
            "time": latest_res.parking_timestamp.strftime("%I:%M:%S %p"),
            "cost": latest_res.parking_cost
        }, 200


    @auth_required('token')
    @roles_required('admin')
    def delete(self, lot_id, spot_number):
        # Find spot based on order
        spot = Parking_Spot.query.filter_by(lot_id=lot_id).order_by(Parking_Spot.id).all()
        if not spot or spot_number > len(spot):
            return {"message": "Spot not found"}, 404

        target_spot = spot[spot_number - 1]
        if target_spot.status != 'A':
            return {"message": "Cannot delete occupied spot"}, 400
        lot = Parking_Lot.query.get(lot_id)
        if lot:
            lot.number_of_spots -= 1

        db.session.delete(target_spot)
        db.session.commit()
        return {"message": "Spot deleted successfully"}, 200
api.add_resource(SpotDetailsApi, "/api/spot/<int:lot_id>/<int:spot_number>")








class UserListApi(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        users = User.query.all()
        result = []
        for user in users:
            bookings = Reservation.query.filter_by(user_id=user.id).all()
            booking_list = []
            for b in bookings:
                booking_list.append({
                    "vehicle_number": b.vehicle_number,
                    "parking_time": b.parking_timestamp.strftime('%d-%m-%Y %I:%M %p'),
                    "release_time": b.release_timestamp.strftime('%d-%m-%Y %I:%M %p') if b.release_timestamp else None,
                    "cost": b.parking_cost if b.parking_cost else "To be calculated"
                })
            result.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "roles": [role.name for role in user.roles],
                "bookings": booking_list  # 👈 VERY IMPORTANT
            })
        return result, 200







class AdminSummary(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        return {
            "total_users": User.query.count(),
            "total_lots": Parking_Lot.query.count(),
            "total_spots": Parking_Spot.query.count()
        }, 200

api.add_resource(AdminSummary, "/api/admin/summary")
