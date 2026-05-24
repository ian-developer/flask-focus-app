from . import db

class Osoba(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ime = db.Column(db.String(50), nullable=False)
    prezime = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f'<Osoba {self.ime} {self.prezime}>'