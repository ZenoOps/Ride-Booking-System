# data persistence layer for user ( file handling methods)
import os
from utils.exceptions import FileHandlingException
from models.rider import Rider
from models.driver import Driver

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class UserStorage:
    def __init__(self, rider_path=None, driver_path=None):
        self.rider_path = rider_path or os.path.join(BASE_DIR, "data", "rider.txt")
        self.driver_path = driver_path or os.path.join(BASE_DIR, "data", "driver.txt")

    def load_riders(self):
        try:
            riders = []
            with open(self.rider_path, "r", encoding="utf-8") as f:
                for line in f:
                    data = line.strip().split(",")
                    rider = Rider(user_id=data[0], name=data[1])
                    riders.append(rider)
            return riders
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error loading riders: {e}")

    def save_riders(self, riders: list[Rider]):
        try:
            with open(self.rider_path, "w", encoding="utf-8") as f:
                for rider in riders:
                    f.write(f"{rider.user_id},{rider.name}\n")
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error saving riders: {e}")

    def load_drivers(self):
        try:
            drivers = []
            with open(self.driver_path, "r", encoding="utf-8") as f:
                for line in f:
                    data = line.strip().split(",")
                    driver = Driver(user_id=data[0], name=data[1], available_status=data[2])
                    drivers.append(driver)
            return drivers
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error loading drivers: {e}")

    def save_drivers(self, drivers: list[Driver]):
        try:
            with open(self.driver_path, "w", encoding="utf-8") as f:
                for driver in drivers:
                    f.write(f"{driver.user_id},{driver.name},{driver.available_status}\n")
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error saving drivers: {e}")