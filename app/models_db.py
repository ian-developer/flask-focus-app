from . import db
from datetime import datetime, timezone
from sqlalchemy.orm import validates

class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    surname = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f'<Person {self.name} {self.surname}>'

class Goal(db.Model):
    __tablename__ = 'goals'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    is_confirmed_finished = db.Column(db.Boolean, default=False)
    progress_percentage = db.Column(db.Float, default=0.0)
    difficulty = db.Column(db.String(20), nullable=False, default='Medium')
    priority = db.Column(db.String(1), nullable=False, default='b')
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    
    # Relationship to cleanly fetch tasks belonging to this goal
    # cascade="all, delete-orphan" ensures tasks are deleted if the goal is deleted
    tasks = db.relationship('Task', backref='goal', cascade="all, delete-orphan", lazy=True)

    # Calculates progress percentage by calculating amount of completed tasks in a goal
    def calculate_progress(self):
        total = len(self.tasks)
        if total == 0:
            self.progress_percentage = 0
        else:
            completed = sum(1 for t in self.tasks if t.is_completed)
            self.progress_percentage = int(round((completed / total) * 100))
        self.is_completed = (self.progress_percentage == 100)


    @validates('title', 'description', 'difficulty', 'priority')
    def validate_text_fields(self, key, value):
        if not value or str(value).strip() == "":
            raise ValueError(f"Field '{key}' cannot be empty.")
        return value.strip()
    
    @validates('progress_percentage')
    def validate_progress(self, key, value):
        try:
            val = int(value)
            if not (0 <= val <= 100):
                raise ValueError()
        except (ValueError, TypeError):
            raise ValueError("Percentage must be between 0 and 100.")
        return val

    def __repr__(self):
        return f'<Goal {self.title}'
    
class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(255), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)

    # Foreign Key linking this task to a parent Goal
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id', ondelete='CASCADE'), nullable=False)

    # Dodajte ovu metodu unutar klase Task
    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'is_completed': self.is_completed,
            'goal_id': self.goal_id
        }