from persistence.trip_storage import TripStorage
from models.trip import Trip
from persistence.user_storage import UserStorage
import os
from controllers.user_controller import UserController

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
valid_user_type = ["rider", "driver"]
class TripController:
    def __init__(self, user_controller = None, user_storage = None, trip_storage = None):
        self.__validate_user_type = valid_user_type
        self.__user_controller = user_controller or UserController()
        self.__trip_storage = trip_storage or TripStorage()
        self.__user_storage = user_storage or UserStorage()

    def start_trip(self, driver_id: str, rider_id: str, plate_number: str, start_point: str, destination: str) -> Trip:
        trip_obj = Trip(driver_id, rider_id, plate_number, start_point, destination)
        res = self.__trip_storage.create_trip(trip_obj)
        return res

    def end_trip(self, trip_id) -> Trip:
        trip = self.__trip_storage.get_trip_by_id(trip_id)
        res = self.__trip_storage.edit_trip(trip_id)
        if trip:
            self.__user_storage.edit_driver(user_id=trip["driver_id"], available_status="True")
        return res

    def cancel_ride(self, trip_id: str, rider_id: str):
        temp_trip = self.__trip_storage.get_temp_trip(trip_id)
        if not temp_trip:
            return None, "Ride request not found."
        if temp_trip["rider_id"] != rider_id:
            return None, "Unauthorized."
        if temp_trip["status"] != "In Process":
            return None, "Only pending rides can be cancelled."
        self.__trip_storage.delete_temp_trip(trip_id)
        return temp_trip, "Ride cancelled."

    def get_pending_trips_for_driver(self, driver_id: str) -> list:
        trips = self.__trip_storage.get_temp_trips_by_driver(driver_id)
        for trip in trips:
            rider, _ = self.__user_controller.get_user_detail(trip["rider_id"], "rider")
            trip["rider_name"] = rider["name"] if rider else "Unknown"
        return trips

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

        driver_name = self.__get_driver_name(trip["driver_id"])
        car_model = self.__get_car_model(trip["plate_number"])

        return {
            "success": True,
            "trip_id": trip["trip_id"],
            "driver_id": trip["driver_id"],
            "driver_name": driver_name,
            "rider_id": trip["rider_id"],
            "plate_number": trip["plate_number"],
            "car_model": car_model,
            "start_point": trip["start_point"],
            "destination": trip["destination"],
            "status": trip["status"],
        }

    def get_trips_by_user(self, user_id: str, user_type: str) -> list:
        if user_type not in valid_user_type:
            raise ValueError("Invalid user type")
        trips = self.__trip_storage.get_all_trip(user_id, user_type)
        for trip in trips:
            trip["driver_name"] = self.__get_driver_name(trip["driver_id"])
            trip["car_model"] = self.__get_car_model(trip["plate_number"])
            rider, _ = self.__user_controller.get_user_detail(trip["rider_id"], "rider")
            trip["rider_name"] = rider["name"] if rider else "Unknown"
        return trips

    def request_ride(self, rider_id: str, start_point: str, destination: str):
        if not rider_id:
            return None, "Ride request failed."
        if not start_point or not destination:
            return None, "Start point and destination are required."
        rider, rider_msg = self.__user_controller.get_user_detail(rider_id, "rider")
        if not rider:
            return None, rider_msg
        driver = self.__user_controller.find_available_driver(start_point)
        if not driver:
            return None, "No available drivers found."
        ride_request = Trip(driver["user_id"], rider["user_id"], driver["plate_number"], start_point, destination)
        self.__trip_storage.create_temp_trip(ride_request)
        return ride_request, "Ride request sent successfully."

    def respond_to_ride(self, trip_id: str, action: str):
        if action not in ("accept", "reject"):
            return None, "Action must be 'accept' or 'reject'."

        temp_trip = self.__trip_storage.get_temp_trip(trip_id)
        if not temp_trip:
            return None, "Ride request not found."

        if action == "accept":
            self.__trip_storage.edit_temp_trip(trip_id, "accepted")
            trip_obj = Trip(
                driver_id=temp_trip["driver_id"],
                rider_id=temp_trip["rider_id"],
                plate_number=temp_trip["plate_number"],
                start_point=temp_trip["start_point"],
                destination=temp_trip["destination"],
                trip_id=temp_trip["trip_id"],
            )
            self.__trip_storage.create_trip(trip_obj)
            self.__user_storage.edit_driver(user_id=temp_trip["driver_id"], available_status="False")
            return temp_trip, "Ride accepted successfully."

        self.__trip_storage.edit_temp_trip(trip_id, "rejected")
        temp_trip["status"] = "rejected"
        return temp_trip, "Ride rejected."
