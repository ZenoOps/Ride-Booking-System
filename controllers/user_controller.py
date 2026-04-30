from persistence.user_storage import UserStorage
from persistence.car_storage import CarStorage
from persistence.rating_storage import RatingStorage
from utils.exceptions import InvalidInputException

class UserController:
    def __init__(self, user_storage=None, car_storage=None, rating_storage=None):
        self.__user_storage = user_storage or UserStorage()
        self.__car_storage = car_storage or CarStorage()
        self.__rating_storage = rating_storage or RatingStorage()
        self.__valid_user_types = ["rider", "driver"]

    def get_user_detail(self, user_id: str, user_type: str):
        user_type = user_type.lower()
        if user_type not in self.__valid_user_types:
            raise InvalidInputException("Invalid user type.")

        target_id = str(user_id)
        if user_type == "rider":
            riders = self.__user_storage.load_riders()
            for rider in riders:
                if rider["user_id"] == target_id:
                    return rider, "Rider found"
        else:
            drivers = self.__user_storage.load_drivers()
            for driver in drivers:
                if driver["user_id"] == target_id:
                    car_model = self.__car_storage.get_car_model(driver["plate_number"])
                    rating_summary = self.__rating_storage.get_driver_rating_summary(driver["user_id"])
                    driver["car_model"] = car_model
                    driver["average_rating"] = rating_summary["average_rating"]
                    driver["rating_count"] = rating_summary["rating_count"]
                    return driver, "Driver found"
        return None, f"{user_type.capitalize()} not found"

    def find_available_driver(self, start_point=None):
        drivers = self.__user_storage.load_drivers()
        for driver in drivers:
            if str(driver["available_status"]).lower() != "true":
                continue
            str_start_point = str(start_point).lower().replace(" ", "")
            str_driver_location = str(driver["current_location"]).lower().replace(" ", "")
            if str_start_point in str_driver_location or str_driver_location in str_start_point:
                return driver
        return None

    def change_driver_location(self, driver_id, new_location=None):
        res = self.__user_storage.edit_driver(user_id=driver_id, current_location=new_location)
        return res

    def change_driver_status(self, driver_id, new_status=None):
        res = self.__user_storage.edit_driver(user_id=driver_id, available_status=new_status)
        return res
