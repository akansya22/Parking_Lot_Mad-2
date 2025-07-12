class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True

class LocalDevelopmentConfig(Config):
    # configration
    SQLALCHEMY_DATABASE_URI = "sqlite:///V_Parking.sqlite3"
    DEBUG = True

    # config for security
    SECRET_KEY = "this-is-a-secret-key" # helps hash user credential in session
    SECURITY_PASSWORD_HASH = "bcrypt" # This is the mechanism for hashing password
    SECURITY_PASSWORD_SALT = "this-is-a-password-salt" # password will more encrypted by using this
    WTF_CSRF_ENABLED = False 
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"