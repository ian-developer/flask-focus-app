from flask import Blueprint, render_template, request, redirect, jsonify
from . import db
from .models_db import Person, Person2, Goal

main = Blueprint("main", __name__)

@main.route("/")
def home():
    return render_template("index.html")

@main.route("/dashboard", methods=['GET', 'POST'])
def dashboard():
    #Get goals sorted by priority: "a, b, c"
    goals = Goal.query.order_by(Goal.priority.asc()).all()
    return render_template('goals.html', goals=goals)

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
    goals = Goal.query.order_by(Goal.priority.asc()).all()
    
    return render_template('goals.html', goals=goals)

@main.route('/add-goal', methods=['POST'])

def add_goal():
    data = request.get_json() or {}

    try:
        tasks_raw = data.get('tasks', '')

        new_goal = Goal(
            title=data.get('title'),
            description=data.get('description'),
            tasks=tasks_raw,
            difficulty=data.get('difficulty'),
            priority=data.get('priority'),
            progress_percentage=int(data.get('progress_percentage', 0)),
            is_completed=int(data.get('progress_percentage', 0)) == 100
        )
    
        db.session.add(new_goal)
        db.session.commit()
        
        return jsonify({
            'id': new_goal.id,
            'title': new_goal.title,
            'description': new_goal.description,
            'tasks': [t.strip() for t in new_goal.tasks.split(',') if t.strip()] if new_goal.tasks else [],
            'difficulty': new_goal.difficulty,
            'priority': new_goal.priority,
            'progress_percentage': new_goal.progress_percentage,
            'is_completed': new_goal.is_completed
        }), 201
    
    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Unexpected server error."}), 500
