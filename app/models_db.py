from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from app import create_app

app = create_app

# Konfiguracija SQLite baze podataka (datoteka će se zvati .db)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///base_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Definiranje modela(tablice) u bazi podataka
class User(db.Model):
    id = id.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f'<User {self.id}>'