from models.user import User

class Driver(User):
    def __init__(self, user_id, name, available_status):
        super().__init__(user_id, name, "driver")
        self.__available_status = available_status

    # available status
    @property
    def available_status(self):
        return self.__available_status

    @available_status.setter
    def available_status(self, new_available_status):
        self.__available_status = new_available_status