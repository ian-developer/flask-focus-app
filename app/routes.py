from flask import Blueprint, render_template, request

main = Blueprint("main", __name__)

@main.route("/")
def home():
    return render_template("index.html")

@main.route("/form")
def form():
    return render_template("form.html")

@main.route("/greet", methods=['GET'])
def handle_submit():
    name = request.args.get('username', '"Empty"')
    return render_template("dashboard.html", name=name)