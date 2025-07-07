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
        lot_jsons = []
        lots = Parking_Lot.query.all()

        for lot in lots:
            lot_jsons.append({
                "id": lot.id,
                "location_name": lot.location_name,
                "price": lot.price,
                "pin_code": lot.pin_code,
                "number_of_spots": lot.number_of_spots
            })
        return lot_jsons, 200

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
