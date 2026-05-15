from flask import Blueprint, render_template, request

main = Blueprint("main", __name__)

@main.route("/")
def home():
    name = request.args.get("name", "Developer")
    return render_template("index.html", name=name)

@main.route("/form")
def form():
    return render_template("form.html")

@main.route("/submit", methods=['POST'])
def handle_submit():
    name = request.form.get('username')
    return f"<h1>Your name is {name}</h1>"