from persistence.trip_storage import TripStorage
from models.trip import Trip
from persistence.user_storage import UserStorage
from utils.exceptions import TripNotFoundException
import os

class TripController:
    def __init__(self, storage=None):
        self.__trip_storage = storage or TripStorage()
        self.__user_storage = UserStorage()
        

    def start_trip(self, driver, rider, car, start_point, destination) -> Trip:
        trip_obj = Trip(driver, rider, car, start_point, destination)
        res = self.__trip_storage.create_trip(trip_obj)
        return res

    def end_trip(self, trip_id) -> Trip:
        res = self.__trip_storage.edit_trip(trip_id)
        return res

    def __get_driver_name(self, driver_id):
        target_id = str(driver_id).strip()
        first_driver_name = None
        try:
            with open(self.__user_storage.driver_path, "r", encoding="utf-8") as f:
                for line in f:
                    parts = [p.strip() for p in line.strip().split(",")]
                    if len(parts) >= 2 and first_driver_name is None:
                        first_driver_name = parts[1]
                    if len(parts) >= 2 and parts[0] == target_id:
                        return parts[1]
        except Exception:
            pass
        return first_driver_name or "Unknown driver"

    def __get_car_model(self, car):
        if hasattr(car, "car_model"):
            return car.car_model

        target_id = str(car).strip()
        car_file = os.path.join(os.path.dirname(self.__user_storage.driver_path), "car.txt")
        first_car_model = None

        try:
            with open(car_file, "r", encoding="utf-8") as f:
                for line in f:
                    parts = [p.strip() for p in line.strip().split(",")]
                    if len(parts) >= 2 and first_car_model is None:
                        first_car_model = parts[1]
                    if len(parts) >= 2 and parts[0] == target_id:
                        return parts[1]
        except Exception:
            pass

        return first_car_model or "Unknown car model"

    def get_trip_detail(self, trip_id):
        if not trip_id:
            return {"success": False, "message": "Trip ID cannot be empty."}

        trip = self.__trip_storage.get_trip_by_id(trip_id)
        if not trip:
            return {"success": False, "message": "Trip not found."}

        driver_name = self.__get_driver_name(trip.driver)
        car_model = self.__get_car_model(trip.car)

        return {
            "success": True,
            "trip_id": trip.trip_id,
            "driver_id": trip.driver,
            "driver_name": driver_name,
            "rider_id": trip.rider,
            "car_id": trip.car,
            "car_model": car_model,
            "start_point": trip.start_point,
            "destination": trip.destination,
            "status": trip.status,
        }

    def get_trips_by_user(self, user_id: str, user_type: str) -> list:
        return self.__trip_storage.get_all_trip(user_id, user_type)

tr = TripController()
# trips = tr.get_all_trip()
# for t in trips:
#     print(t.trip_id)
# create_tr = tr.start_trip(1010,2020,303,"Bkk","ChiangMai")
# print(create_tr.trip_id)
# edit_tr = tr.end_trip("a70e93d4-e210-45d4-8c75-189c828b61c")
