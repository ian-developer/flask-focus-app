from flask import Blueprint, render_template, request, redirect
from models_db import *

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

@main.route("/user", methods=['GET', 'POST'])
def register_user():
    if request.method == 'POST':
        username = request.form.get('username')
        if username:
            new_username = User(username=username)
            db.session.add(new_username)
            db.session.commit(new_username)
        return redirect('/user')
    all_users = User.querry.all()
    return render_template(register_user.html, users=all_users)