from flask import Blueprint, render_template, request, redirect
from . import db
from .models_db import Osoba

main = Blueprint("main", __name__)

@main.route("/")
def home():
    return render_template("index.html")

@main.route("/form")
def form():
    return render_template("form.html")

@main.route("/dashboard", methods=['GET', 'POST'])
def handle_submit():
    name = request.args.get('username')
    email = request.args.get('email')
    if not name or not email:
        return render_template("error.html")
    return render_template("dashboard.html", name=name, email=email)

@main.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Dohvaćanje podataka iz forme
        ime_osobe = request.form.get('ime')
        prezime_osobe = request.form.get('prezime')
        
        if ime_osobe and prezime_osobe:
            # Kreiranje novog objekta i spremanje u bazu
            nova_osoba = Osoba(ime=ime_osobe, prezime=prezime_osobe)
            db.session.add(nova_osoba)
            db.session.commit()
            
        return redirect('/')
    
    # Dohvaćanje svih osoba iz baze za prikaz
    sve_osobe = Osoba.query.all()
    return render_template('form.html', osobe=sve_osobe)