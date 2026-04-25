from models.user import User

class Driver(User):
    def __init__(self, user_id, name, available_status=None, current_location=None, plate_number=None):
        super().__init__(user_id, name, "driver")
        self.__available_status = available_status or True
        self.__current_location = current_location or "Bang Sue"
        self.__plate_number = plate_number

    # available status
    @property
    def available_status(self):
        return self.__available_status

    @available_status.setter
    def available_status(self, new_available_status):
        self.__available_status = new_available_status

    # current location
    @property
    def current_location(self):
        return self.__current_location

    @current_location.setter
    def current_location(self, new_current_location):
        self.__current_location = new_current_location

    # plate number
    @property
    def plate_number(self):
        return self.__plate_number

    @plate_number.setter
    def plate_number(self, new_plate_number):
        self.__plate_number = new_plate_number