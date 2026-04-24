from models.rider import Rider
from models.driver import Driver
from models.car import Car
from utils.uuid_generators import UuidGenerator

class Trip:
    def __init__(self, driver, rider, car, start_point, destination, trip_id = None, status = None):
        self.__trip_id = trip_id or UuidGenerator.generate_trip_uuid()
        self.__driver = driver
        self.__rider = rider
        self.__car = car
        self.__start_point = start_point
        self.__destination = destination
        self.__status = status or "In Process"

    # trip_id
    @property
    def trip_id(self):
        return self.__trip_id

    @property
    def driver(self):
        return self.__driver

    @driver.setter
    def driver(self, driver):
        self.__driver = driver

    @property
    def rider(self):
        return self.__rider

    @rider.setter
    def rider(self, rider):
        self.__rider = rider

    @property
    def car(self):
        return self.__car

    @car.setter
    def car(self, car):
        self.__car = car

    @property
    def start_point(self):
        return self.__start_point

    @start_point.setter
    def start_point(self, start_point):
        self.__start_point = start_point

    @property
    def destination(self):
        return self.__destination

    @destination.setter
    def destination(self, destination):
        self.__destination = destination

    @property
    def status(self):
        return self.__status

    @status.setter
    def status(self, status):
        self.__status = status
