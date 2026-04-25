from persistence.trip_storage import TripStorage
from models.trip import Trip
from utils.exceptions import TripNotFoundException

class TripController:
    def __init__(self):
        self.__trip_storage = TripStorage()

    def get_all_trip(self):
        trip_list = self.__trip_storage.get_all_trip()
        return trip_list

    def start_trip(self, driver_id, rider_id, car_id, start_point, destination):
        trip_obj = Trip(driver_id, rider_id, car_id, start_point, destination)
        res = self.__trip_storage.create_trip(trip_obj)
        return res

    def end_trip(self, trip_id):
        res = self.__trip_storage.edit_trip(trip_id)
        return res

    def get_trip_detail(self, trip_id):
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
            
tr = TripController()
# trips = tr.get_all_trip()
# for t in trips:
#     print(t.trip_id)
# create_tr = tr.start_trip(1010,2020,303,"Bkk","ChiangMai")
# print(create_tr.trip_id)
# edit_tr = tr.end_trip("a70e93d4-e210-45d4-8c75-189c828b61c")