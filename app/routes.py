from flask import Blueprint, render_template, request

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
    if not request.args.get('username'):
        return render_template("error.html")
    return render_template("dashboard.html", name=name)