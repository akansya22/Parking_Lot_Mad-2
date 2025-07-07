from .database import db
from .models import User, Role
from flask import current_app as app, jsonify, request, render_template
from flask_security import auth_required, roles_required, roles_accepted, current_user, login_user
from werkzeug.security import check_password_hash, generate_password_hash
from .util import roles_list


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



