# models.py
from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime


# --------------------------
# User and Admin Models
# --------------------------

class User(db.Model, UserMixin):
    # required for flask security
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    username = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    fs_uniquifier = db.Column(db.String, unique = True, nullable = False)
    active = db.Column(db.Boolean, nullable = False)
    roles =  db.relationship("Role", backref = 'bearer', secondary =  'users_roles')
    
    reservations = db.relationship('Reservation', backref='bearer', cascade="all,delete")


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique = True, nullable = False)
    description = db.Column(db.String)


class UsersRoles(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))


# --------------------------
# Parking Lot Model
# --------------------------

class Parking_Lot(db.Model):
    __tablename__ = "parking_lot"
    id = db.Column(db.Integer, primary_key=True)
    location_name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)  # price per unit time
    pin_code = db.Column(db.String(10), nullable=False)
    number_of_spots = db.Column(db.Integer, nullable=False)

    spots = db.relationship("Parking_Spot", backref="parking_lot", lazy=True, cascade="all, delete")

# --------------------------
# Parking Spot Model
# --------------------------

class Parking_Spot(db.Model):
    __tablename__ = "parking_spot"
    id = db.Column(db.Integer, primary_key=True)
    lot_id = db.Column(db.Integer, db.ForeignKey('parking_lot.id'), nullable=False)
    status = db.Column(db.String(1), default='A')  # A = Available, O = Occupied

    reservations = db.relationship('Reservation', backref='parking_spot', lazy=True)

# --------------------------
# Reservation Model
# --------------------------

class Reservation(db.Model):
    __tablename__ = "reservation"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    spot_id = db.Column(db.Integer, db.ForeignKey('parking_spot.id'), nullable=False)
    parking_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    leaving_timestamp = db.Column(db.DateTime, nullable=True)
    parking_cost = db.Column(db.Float, default=0.0)
    remarks = db.Column(db.String(255), nullable=True)



