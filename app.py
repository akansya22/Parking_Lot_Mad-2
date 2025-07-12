from flask import Flask
from backend.database import db
from backend.models import User, Role
from backend.resources import api
from backend.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash
from backend.celery_init import celery_init_app
from flask_caching import Cache




# ✅ Redis Cache Configuration

cache = Cache(config={
    'CACHE_TYPE': 'RedisCache',
    'CACHE_REDIS_HOST': 'localhost',
    'CACHE_REDIS_PORT': 6379,
    'CACHE_REDIS_DB': 0,
    'CACHE_DEFAULT_TIMEOUT': 300
})

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)

    db.init_app(app)
    api.init_app(app)

    cache.init_app(app)           # 🔥 Initialize cache with app
    app.cache = cache             # 🔥 Attach cache to app instance

    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    return app

app = create_app()
celery = celery_init_app(app)


with app.app_context():
    db.create_all()

    app.security.datastore.find_or_create_role(name="admin", description="SuperUser")
    app.security.datastore.find_or_create_role(name="user", description="GeneralUser")
    db.session.commit()

    if not app.security.datastore.find_user(email="a.kansya22@gmail.com"):
        app.security.datastore.create_user(email="a.kansya22@gmail.com",
                                           username="Avinash",
                                           password=generate_password_hash("Ganeshaa"),
                                           roles=["admin"])
        
    if not app.security.datastore.find_user(email="chipu@gmail.com"):
        app.security.datastore.create_user(email="chipu@gmail.com",
                                           username="Chipu",
                                           password=generate_password_hash("chipu"),
                                           roles=["user"])
    db.session.commit()

from backend.routes import *

if __name__=="__main__":
    app.run()
    