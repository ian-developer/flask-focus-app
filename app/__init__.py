from flask import Flask
#from base_db import base_blueprint

def create_app():
    app = Flask(__name__)

    from .routes import main
    app.register_blueprint(main)

    return app