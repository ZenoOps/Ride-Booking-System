import os
from utils.exceptions import FileHandlingException, InvalidInputException
from models.trip import Trip

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class TripStorage:
    def __init__(self, file_path=None):
        self.__file_path = file_path or os.path.join(BASE_DIR, "data", "trip.txt")
        self.temp_file_path = os.path.join(BASE_DIR, "data", "temp_trip.txt")

    def __parse_trip(self, data) -> dict:
        return Trip(
            trip_id=data[0],
            driver_id=data[1],
            rider_id=data[2],
            plate_number=data[3],
            start_point=data[4],
            destination=data[5],
            status=data[6]
        ).to_dict()

    def create_temp_trip(self, trip_obj):
        try:
            with open(self.temp_file_path, "a") as file:
                file.write(f"{trip_obj.trip_id}, {trip_obj.driver}, {trip_obj.rider}, {trip_obj.car}, {trip_obj.start_point}, {trip_obj.destination}, {trip_obj.status}\n")
            return True
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error creating temp trip: {e}")

    def get_temp_trip(self, trip_id):
        try:
            with open(self.temp_file_path, "r") as file:
                for line in file:
                    if not line.strip():
                        continue
                    data = line.strip().split(", ")
                    if data[0] == trip_id:
                        return self.__parse_trip(data)
            return None
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error loading temp trip: {e}")

    def edit_temp_trip(self, trip_id, status):
        try:
            found = False
            with open(self.temp_file_path, "r") as file:
                lines = file.readlines()
            with open(self.temp_file_path, "w") as file:
                for line in lines:
                    if not line.strip():
                        continue
                    data = line.strip().split(", ")
                    if data[0] == trip_id:
                        file.write(f"{data[0]}, {data[1]}, {data[2]}, {data[3]}, {data[4]}, {data[5]}, {status}\n")
                        found = True
                    else:
                        file.write(line)
            if not found:
                raise InvalidInputException("Trip ID not found in temp trips")
            return True
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error editing temp trip: {e}")

    def delete_temp_trip(self, trip_id: str) -> bool:
        try:
            found = False
            with open(self.temp_file_path, "r") as file:
                lines = file.readlines()
            with open(self.temp_file_path, "w") as file:
                for line in lines:
                    if not line.strip():
                        continue
                    data = line.strip().split(", ")
                    if data[0] == trip_id:
                        found = True
                    else:
                        file.write(line)
            return found
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error deleting temp trip: {e}")

    def get_temp_trips_by_driver(self, driver_id: str):
        try:
            trips = []
            with open(self.temp_file_path, "r") as file:
                for line in file:
                    if not line.strip():
                        continue
                    data = line.strip().split(", ")
                    if len(data) >= 7 and data[1] == driver_id and data[6] == "In Process":
                        trips.append(self.__parse_trip(data))
            return trips
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error loading temp trips: {e}")

    def create_trip(self, trip_obj):
        try:
            with open(self.__file_path, "a") as file:
                file.write(f"{trip_obj.trip_id}, {trip_obj.driver}, {trip_obj.rider}, {trip_obj.car}, {trip_obj.start_point}, {trip_obj.destination}, {trip_obj.status}\n")
            return trip_obj
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error creating trip: {e}")

    def edit_trip(self, trip_id):
        try:
            found = False
            result = None
            with open(self.__file_path, "r") as file:
                lines = file.readlines()
            with open(self.__file_path, "w") as file:
                for line in lines:
                    if not line.strip():
                        continue
                    data = line.strip().split(", ")
                    if data[0] == trip_id:
                        file.write(f"{data[0]}, {data[1]}, {data[2]}, {data[3]}, {data[4]}, {data[5]}, Completed\n")
                        found = True
                        result = self.__parse_trip([data[0], data[1], data[2], data[3], data[4], data[5], "Completed"])
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
            with open(self.__file_path, "r") as file:
                for line in file:
                    if not line.strip():
                        continue
                    data = line.strip().split(", ")
                    if ((user_type == "driver" and data[1] == user_id) or
                        (user_type == "rider" and data[2] == user_id)):
                        trips.append(self.__parse_trip(data))
            return trips
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error loading trips: {e}")

    def get_trip_by_id(self, trip_id):
        try:
            with open(self.__file_path, "r") as file:
                for line in file:
                    if not line.strip():
                        continue
                    data = line.strip().split(", ")
                    if data[0] == trip_id:
                        return self.__parse_trip(data)
            return None
        except (OSError, IOError) as e:
            raise FileHandlingException(f"File not found: {self.__file_path}") from e
