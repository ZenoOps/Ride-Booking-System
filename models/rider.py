from models.user import User

class Rider(User):
    def __init__(self, user_id, name, password=None):
        super().__init__(user_id, name, password)
        self.user_type = "rider"
    
    def to_dict(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "user_type": self.user_type
        }