from models.car import Car
from utils.uuid_generators import UuidGenerator
from models.rider import Rider
from models.driver import Driver

class Trip:
    def __init__(self, driver_id: str, rider_id: str, plate_number: str, start_point: str, destination: str, trip_id: str = None, status: str = None):
        self.__trip_id = str(trip_id) if trip_id else str(UuidGenerator.generate_trip_uuid())
        self.__driver_id = driver_id
        self.__rider_id = rider_id
        self.__plate_number = plate_number
        self.__start_point = start_point
        self.__destination = destination
        self.__status = status or "In Process"

    # trip_id
    @property
    def trip_id(self):
        return self.__trip_id

    @property
    def driver(self):
        return self.__driver_id

    @property
    def rider(self):
        return self.__rider_id

    @property
    def car(self):
        return self.__plate_number

    @property
    def start_point(self):
        return self.__start_point

    @property
    def destination(self):
        return self.__destination

    @property
    def status(self):
        return self.__status

    def to_dict(self):
        return {
            "trip_id": self.__trip_id,
            "rider_id": self.__rider_id,
            "driver_id": self.__driver_id,
            "plate_number": self.__plate_number,
            "start_point": self.__start_point,
            "destination": self.__destination,
            "status": self.__status
        }
