from flask import Blueprint, render_template, request, redirect, jsonify, url_for
from . import db
from .models_db import Goal

main = Blueprint("main", __name__)

# ---------------HOMEPAGE----------------

@main.route("/")
def home():
    goals = Goal.query.order_by(Goal.priority.asc()).all()
    number_of_goals = 0

    for goal in goals:
        number_of_goals = number_of_goals + 1
    
    return render_template("index.html", number_of_goals=number_of_goals)

# ---------------DASHBOARD----------------

@main.route("/dashboard", methods=['GET', 'POST'])
def dashboard():
    goals = Goal.query.order_by(Goal.priority.asc()).all()

    return render_template('dashboard.html', goals=goals)

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
    
@main.route('/goals/<int:goal_id>')
def view_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)

    tasks_list = [t.strip() for t in goal.tasks.split(',') if t.strip()] if goal.tasks else []

    return render_template('view_goal.html', goal=goal, tasks=tasks_list)

@main.route('/goals/<int:goal_id>/delete', methods=['POST'])
def delete_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)
    
    try:
        db.session.delete(goal)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        
    return redirect(url_for('main.show_goals'))

