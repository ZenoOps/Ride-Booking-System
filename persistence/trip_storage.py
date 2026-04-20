import os
from utils.exceptions import FileHandlingException
from models.trip import Trip

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class TripStorage:
    def __init__(self, file_path=None):
        self.file_path = file_path or os.path.join(BASE_DIR, "data", "trip.txt")

    def get_all_trip(self):
        try:
            trips = []
            with open(self.file_path, "r") as file:
                lines = file.readlines()
                for line in lines:
                    data = line.strip().split(",")
                    # need to call user detail and car detail
                    trip = Trip(trip_id=data[0], driver=data[1], rider=data[2], car=data[3], start_point=data[4], destination=data[5], status=data[6])
                    trips.append(trip)
            return trips
        except FileHandlingException as e:
            raise e