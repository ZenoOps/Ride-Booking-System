from persistence.trip_storage import TripStorage
from models.trip import Trip
from utils.exceptions import TripNotFoundException

class TripController:
    def __init__(self, storage=None):
        self.__trip_storage = storage or TripStorage()

    def start_trip(self, driver, rider, car, start_point, destination) -> Trip:
        trip_obj = Trip(driver, rider, car, start_point, destination)
        res = self.__trip_storage.create_trip(trip_obj)
        return res

    def end_trip(self, trip_id) -> Trip:
        res = self.__trip_storage.edit_trip(trip_id)
        return res

    def get_trip_detail(self, trip_id) -> dict:
            # The step that checks whether the trip ID has provided and if not throws an error
            if not trip_id:
                raise TripNotFoundException("Trip cannot be empty")
                
            # If the trip ID is not valid this will throws an error
            trip = self.__trip_storage.get_trip_by_id(trip_id)
            if not trip:
                raise TripNotFoundException("Trip not found")

            return {
                "success": True,
                "trip_id": trip.trip_id,
                "driver_id": trip.driver,  
                "rider_id": trip.rider,    
                "car_id": trip.car,        
                "start_point": trip.start_point,
                "destination": trip.destination,
                "status": trip.status
            }

    def get_trips_by_user(self, user_id: str, user_type: str) -> list:
        return self.__trip_storage.get_all_trip(user_id, user_type)