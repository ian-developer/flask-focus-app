from flask import Blueprint, render_template, request, redirect
from . import db
from .models_db import Person, Goal

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

@main.route('/delete/<int:person_id>', methods=['POST'])
def delete_person(person_id):
    person_to_delete = Person.query.get_or_404(person_id)

    db.session.delete(person_to_delete)
    db.session.commit()

    return redirect('/form')

# ----------------GOALS-----------------

@main.route('/goals')
def show_goals():
    #Get goals sorted by priority: "a, b, c"
    goals = Goal.query.order_by(Goal.priority.asc()).all()
    return render_template('goals.html', goals=goals)

@main.route('/add-goal', methods=['POST'])
def add_goal():
    title = request.form.get('title')
    description = request.form.get('description')
    
    # Pretvaranje unesenog teksta sa zarezima u pravu Python listu
    raw_tasks = request.form.get('tasks', '')
    tasks_list = [t.strip() for t in raw_tasks.split(',') if t.strip()]
    
    difficulty = request.form.get('difficulty', 'Srednje')
    priority = request.form.get('priority', 'b')
    progress = float(request.form.get('progress_percentage', 0))
    
    # Ako je napredak 100%, automatski označi kao riješeno
    is_completed = True if progress == 100 else False

    # Kreiranje novog objekta
    new_goal = Goal(
        title=title,
        description=description,
        tasks=tasks_list,
        is_completed=is_completed,
        progress_percentage=progress,
        difficulty=difficulty,
        priority=priority
    )

    # Spremanje u bazu
    db.session.add(new_goal)
    db.session.commit()

    return redirect('/goals')