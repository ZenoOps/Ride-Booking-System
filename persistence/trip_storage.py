import os
from utils.exceptions import FileHandlingException, InvalidInputException
from models.trip import Trip

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class TripStorage:
    def __init__(self, file_path=None):
        self.file_path = file_path or os.path.join(BASE_DIR, "data", "trip.txt")

    def create_trip(self, trip_obj):
        try:
            with open(self.file_path, "a") as file:
                file.write(f"{trip_obj.trip_id}, {trip_obj.driver}, {trip_obj.rider}, {trip_obj.car}, {trip_obj.start_point}, {trip_obj.destination}, {trip_obj.status}\n")
            return trip_obj
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error creating trip: {e}")

    def edit_trip(self, trip_id):
        try:
            found = False
            result = None
            with open(self.file_path, "r") as file:
                lines = file.readlines()

            with open(self.file_path, "w") as file:
                for line in lines:
                    if not line.strip():
                        continue
                    data = line.strip().split(", ")
                    if data[0] == trip_id:
                        file.write(f"{data[0]}, {data[1]}, {data[2]}, {data[3]}, {data[4]}, {data[5]}, Completed\n")
                        found = True
                        result = Trip(trip_id=data[0], driver=data[1], rider=data[2], car=data[3], start_point=data[4], destination=data[5], status='Completed')
                    else:
                        file.write(line)

            if not found:
                raise InvalidInputException("ID is not correct")
            return result

        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error editing trip: {e}")

    def get_all_trip(self, user_id: str, user_type: str):
        try:
            trips = []
            with open(self.file_path, "r") as file:
                for line in file:
                    if not line.strip():
                        continue
                    data = line.strip().split(", ")
                    if (user_type == "admin" or
                            (user_type == "driver" and data[1] == user_id) or
                            (user_type == "rider" and data[2] == user_id)):
                        trips.append(Trip(
                            trip_id=data[0], driver=data[1], rider=data[2], car=data[3],
                            start_point=data[4], destination=data[5], status=data[6]
                        ))
            return trips
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error loading trips: {e}")

    def get_trip_by_id(self, trip_id):

        # Reading the data from the trip.txt
        try:
            with open(self.file_path, "r") as file:
                lines = file.readlines()
                for line in lines:
                    data = line.strip().split(", ")
                
                    if data[0] == trip_id:
                        return Trip(
                            trip_id=data[0], 
                            driver=data[1], 
                            rider=data[2], 
                            car=data[3], 
                            start_point=data[4], 
                            destination=data[5], 
                            status=data[6]
                        )
            return None 

        except Exception:
            raise FileHandlingException(f"File not found: {self.file_path}") from None
