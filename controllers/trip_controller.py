from persistence.trip_storage import TripStorage
from models.trip import Trip

class TripController:
    def __init__(self, storage=None):
        self.__trip_storage = storage or TripStorage()

    def start_trip(self, driver, rider, car, start_point, destination):
        trip_obj = Trip(driver, rider, car, start_point, destination)
        res = self.__trip_storage.create_trip(trip_obj)
        return res

    def end_trip(self, trip_id):
        res = self.__trip_storage.edit_trip(trip_id)
        return res

    def get_trips_by_user(self, user_id: str, user_type: str) -> list:
        return self.__trip_storage.get_all_trip(user_id, user_type)
