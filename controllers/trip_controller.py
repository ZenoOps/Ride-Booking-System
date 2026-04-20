from persistence.trip_storage import TripStorage

class TripController:
    def __init__(self):
        self.__trip_storage = TripStorage()

    def get_all_trip(self):
        trip_list = self.__trip_storage.get_all_trip()
        return trip_list

# trip = TripController()
# trips = trip.get_all_trip()
# for t in trips:
#     print(t.trip_id)