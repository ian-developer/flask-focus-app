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
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    tasks = db.Column(db.JSON, nullable=True, default=[])
    is_completed = db.Column(db.Boolean, default=False)
    progress_percentage = db.Column(db.Float, default=0.0)
    difficulty = db.Column(db.String(20), nullable=False, default='Medium')
    priority = db.Column(db.String(1), nullable=False, default='b')
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    

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