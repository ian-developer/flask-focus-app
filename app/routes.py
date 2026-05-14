from flask import Blueprint, render_template, request

main = Blueprint("main", __name__)

@main.route("/")
def home():
    name = request.args.get("name", "Developer")
    return render_template("index.html", name=name)