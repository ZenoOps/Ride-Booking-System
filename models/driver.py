from models.user import User

class Driver(User):
    def __init__(self, user_id, name, password = None, available_status=None, current_location=None, plate_number=None):
        super().__init__(user_id, name, password)
        self.__available_status = available_status or True
        self.__current_location = current_location.strip() if current_location else "Bang Sue"
        self.__plate_number = plate_number
        self.user_type = "driver"

    @property
    def available_status(self):
        return self.__available_status

    @property
    def current_location(self):
        return self.__current_location

    @property
    def plate_number(self):
        return self.__plate_number

    def to_dict(self):
        return {
            "user_id": self._user_id,
            "name": self._name,
            "available_status": self.__available_status,
            "current_location": self.__current_location,
            "plate_number": self.__plate_number
        }