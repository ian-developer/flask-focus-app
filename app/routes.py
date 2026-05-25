from flask import Blueprint, render_template, request, redirect
from . import db
from .models_db import Person

main = Blueprint("main", __name__)

@main.route("/")
def home():
    return render_template("index.html")

@main.route("/dashboard", methods=['GET', 'POST'])
def handle_submit():
    name = request.args.get('username')
    email = request.args.get('email')
    if not name or not email:
        return render_template("error.html")
    return render_template("dashboard.html", name=name, email=email)

@main.route('/form', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # fetching data from the form
        person_name = request.form.get('name')
        person_surname = request.form.get('surname')
        
        if person_name and person_surname:
            # Creating new object and storing it in the database
            new_person = Person(name=person_name, surname=person_surname)
            db.session.add(new_person)
            db.session.commit()
            
        return redirect('/form')
    
    # Dohvaćanje svih osoba iz baze za prikaz
    all_persons = Person.query.all()
    return render_template('form.html', persons=all_persons)