from persistence.user_storage import UserStorage

class UserController:
    def __init__(self):
        self.__user_storage = UserStorage()
        self.__riders = self.__user_storage.load_riders()
        self.__drivers = self.__user_storage.load_drivers()

    def get_riders(self):
        return self.__riders

    def request_ride(self, rider):
        if rider is None:
            return "Ride request failed. Rider is not registered."
        return f"Ride requested successfully by {rider.name}."

    def change_driver_location(self, driver_id, new_location = None):
        res = self.__user_storage.edit_driver(user_id=driver_id, current_location = new_location)
        return res

user_controller = UserController()
# try:
#     rider = user_controller.get_riders()[15]
#     print(user_controller.request_ride(rider))
# except IndexError:
#     print("No riders found.")