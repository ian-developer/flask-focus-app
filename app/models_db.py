from . import db

class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    surname = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f'<Person {self.name} {self.surname}>'

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)

    # Tasks saved as a JSON list (ex. ["Task 1", "Task 2"])
    tasks = db.Column(db.JSON, nullable=True, default=[])

    is_completed = db.Column(db.Boolean, default=False)
    progress_percentage = db.Column(db.Float, default=0.0)

    # Goal difficulty (ex. Easy, Medium, Hard)
    difficulty = db.Column(db.String(20), nullable=False, default='Medium')

    # Goal priority: a, b, c
    priority = db.Column(db.String(1), nullable=False, default='b')

    def __repr__(self):
        return f'<Goal {self.title}'