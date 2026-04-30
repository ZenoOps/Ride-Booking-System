class User:
    def __init__(self, user_id, name, password):
        self._user_id = user_id
        self._name = name
        self._password = password

    @property
    def user_id(self):
        return self._user_id

    @property
    def name(self):
        return self._name

    @property
    def password(self):
        return self._password

    def to_dict(self):
        return {
            "user_id": self._user_id,
            "name": self._name
        }