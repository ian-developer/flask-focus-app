from flask import Flask
from flask_sqlalchemy import SQLAlchemy

#Initialisation of database outside of create_app so other modules can use it
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    # Konfiguracija SQLite baze podataka
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///base.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Povezivanje baze s aplikacijom
    db.init_app(app)

    from .routes import main
    app.register_blueprint(main)
    
    # Automatsko kreiranje tablica ako ne postoje
    with app.app_context():
        db.create_all()
        
    return app