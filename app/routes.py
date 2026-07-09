import traceback
from flask import Blueprint, render_template, request, redirect, jsonify, url_for
from . import db
from datetime import datetime, timezone
from .models_db import Goal, Task

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

# ----- ADD GOAL IN GOALS ------------

@main.route('/add-goal', methods=['POST'])
def add_goal():
    data = request.get_json() or {}

    try:
        new_goal = Goal(
            title=data.get('title'),
            description=data.get('description'),
            difficulty=data.get('difficulty'),
            priority=data.get('priority'),
            created_at=datetime.now(timezone.utc)
        )
    
        db.session.add(new_goal)
        db.session.flush()

        # Parse initial bulk text field tasks (comma or newline separated)
        tasks_raw = data.get('tasks', '')

        if tasks_raw:
            raw_list = tasks_raw.split(',') if ',' in tasks_raw else tasks_raw.split('\n')
            for t in raw_list:
                if t.strip():
                    new_task = Task(text=t.strip(), goal_id=new_goal.id)
                    db.session.add(new_task)
        
        db.session.commit()
        new_goal.calculate_progress() # Initial update
        db.session.commit()

        # Pretvorite listu SQLAlchemy objekata u listu običnih rječnika
        serialized_tasks = [task.to_dict() for task in new_goal.tasks]
        
        return jsonify({
            'id': new_goal.id,
            'title': new_goal.title,
            'description': new_goal.description,
            'tasks': serialized_tasks,
            'difficulty': new_goal.difficulty,
            'priority': new_goal.priority,
            'progress_percentage': new_goal.progress_percentage,
            'is_completed': new_goal.is_completed,
            'created_at': new_goal.created_at.replace(tzinfo=timezone.utc).isoformat()
        }), 201
    
    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
        
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"error": "Unexpected server error."}), 500

#---- TOGGLE TASK CHECKBOX STATUS -------

@main.route('/api/tasks/<int:task_id>/toggle', methods=['PATCH'])
def toggle_task(task_id):
    data = request.get_json() or {}
    task = Task.query.get_or_404(task_id)
    
    task.is_completed = data.get('is_completed', False)
    db.session.commit()
    
    # Force recalculation on parent goal
    task.goal.calculate_progress()
    db.session.commit()
    
    return jsonify({
        'task_id': task.id,
        'is_completed': task.is_completed,
        'progress_percentage': task.goal.progress_percentage
    })

#------ (NOT IN FUNCTION) MODIFY TASK TEXT -----

@main.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task_text(task_id):
    data = request.get_json() or {}
    task = Task.query.get_or_404(task_id)
    
    task.text = data.get('text', task.text).strip()
    db.session.commit()
    return jsonify({'id': task.id, 'text': task.text})

# 4. Inline Add a Task directly into the view layout later
@main.route('/api/goals/<int:goal_id>/tasks', methods=['POST'])
def add_single_task(goal_id):
    data = request.get_json() or {}
    goal = Goal.query.get_or_404(goal_id)
    
    new_task = Task(text=data.get('text', '').strip(), goal_id=goal.id)
    db.session.add(new_task)
    db.session.commit()
    
    goal.calculate_progress()
    db.session.commit()
    
    return jsonify({
        'id': new_task.id,
        'text': new_task.text,
        'is_completed': new_task.is_completed,
        'progress_percentage': goal.progress_percentage
    }), 201

#---------- VIEW SPECIFIC GOAL ---------------

@main.route('/goals/<int:goal_id>')
def view_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)

    tasks_list = goal.tasks

    return render_template('view_goal.html', goal=goal, tasks=tasks_list)

#---------- DELETE SPECIFIC GOAL ----------------

@main.route('/goals/<int:goal_id>/delete', methods=['POST'])
def delete_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)
    
    try:
        db.session.delete(goal)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        
    return redirect(url_for('main.show_goals'))

