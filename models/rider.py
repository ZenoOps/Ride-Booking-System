from models.user import User

class Rider(User):
    def __init__(self, user_id, name):
        super().__init__(user_id, name, "rider")