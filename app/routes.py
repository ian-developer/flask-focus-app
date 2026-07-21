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

#---------- VIEW SPECIFIC GOAL ---------------

@main.route('/goals/<int:goal_id>')
def view_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)

    tasks_list = goal.tasks

    return render_template('view_goal.html', goal=goal, tasks=tasks_list)

#---------- DELETE SPECIFIC GOAL ---------------

@main.route('/goals/<int:goal_id>/delete/', methods=['POST'])
def delete_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)
    
    try:
        db.session.delete(goal)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        
    return redirect(url_for('main.show_goals'))

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

#------ DELETE SPECIFIC TASK, IN VIEW GOAL CARD -----

@main.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):

    task = Task.query.get_or_404(task_id)
    goal_id = task.goal_id
    
    try:
        # 3. Obriši iz baze
        db.session.delete(task)
        db.session.commit()
        
        # 4. Vrati uspješan JSON odgovor (najbolja praksa za API i JavaScript DELETE zahtjeve)
        return jsonify({
            "status": "success", 
            "message": "Zadatak uspješno obrisan",
            "redirect_url": url_for('main.view_goal', goal_id=goal_id)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Greška pri brisanju"}), 500


#------ ADD NEW TASK, IN VIEW GOAL CARD -----

@main.route('/api/tasks/<int:goal_id>', methods=['POST'])
def add_single_task(goal_id):
    data = request.get_json() or {}


    if not data:
        return jsonify({'success': False, 'message': 'Nema podataka'}), 400

    goal_id = data.get('goal_id')
    task_text = data.get('task_text')

    if not goal_id or not task_text:
        return jsonify({'success': False, 'message': 'Nedostaju podaci'}), 400

    try:
        new_task = Task(
            goal_id = int(goal_id),
            text = task_text,
            is_completed = False
        )

        db.session.add(new_task)
        db.session.commit()

        return jsonify({
                'success': True, 
                'message': 'Zadatak uspješno spremljen!',
                'task_text': new_task.text,
                'new_task_id': new_task.id
            }), 200
    
    except Exception as e:
        db.session.rollback() # U slučaju greške poništavamo izmjene
        print(f"SQLAlchemy greška: {e}")
        return jsonify({'success': False, 'message': 'Greška pri upisu u bazu'}), 500