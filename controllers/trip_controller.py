from persistence.trip_storage import TripStorage
from models.trip import Trip

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

tr = TripController()
# trips = tr.get_all_trip()
# for t in trips:
#     print(t.trip_id)
# create_tr = tr.start_trip(1010,2020,303,"Bkk","ChiangMai")
# print(create_tr.trip_id)
# edit_tr = tr.end_trip("a70e93d4-e210-45d4-8c75-189c828b61c")