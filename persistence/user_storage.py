import os
from utils.exceptions import FileHandlingException, InvalidInputException
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
                    if not line.strip():
                        continue
                    data = line.strip().split(", ")
                    rider = Rider(user_id=data[0], name=data[1], password=data[2]).to_dict()
                    riders.append(rider)
            return riders
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error loading riders: {e}")

    def load_drivers(self):
        try:
            drivers = []
            with open(self.driver_path, "r", encoding="utf-8") as f:
                for line in f:
                    if not line.strip():
                        continue
                    data = line.strip().split(", ")
                    # file format: user_id, name, password, available_status, current_location, plate_number
                    driver = Driver(user_id=data[0], name=data[1], available_status=data[3], current_location=data[4], plate_number=data[5]).to_dict()
                    drivers.append(driver)
            return drivers
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error loading drivers: {e}")

    def save_riders(self, riders: list[Rider]):
        try:
            with open(self.rider_path, "w", encoding="utf-8") as f:
                for rider in riders:
                    f.write(f"{rider.user_id}, {rider.name}, {rider.password}\n")
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error saving riders: {e}")

    def save_drivers(self, drivers: list):
        try:
            with open(self.driver_path, "w", encoding="utf-8") as f:
                for driver in drivers:
                    f.write(f"{driver.user_id}, {driver.name}, {driver.password}, {driver.available_status}, {driver.current_location}, {driver.plate_number}\n")
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error saving drivers: {e}")

    def edit_driver(self, user_id, available_status = None, current_location = None):
        if current_location:
            current_location = current_location.strip()
        try:
            found = False
            result = None
            with open(self.driver_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
            with open(self.driver_path, "w", encoding="utf-8") as f:
                for line in lines:
                    if not line.strip():
                        continue
                    data = line.strip().split(", ")
                    if data[0] == user_id:
                        available_status = available_status if available_status else data[3]
                        current_location = current_location if current_location else data[4]
                        f.write(f"{data[0]}, {data[1]}, {data[2]}, {available_status}, {current_location}, {data[5]}\n")
                        found = True
                        result = Driver(user_id=data[0], name=data[1], available_status=available_status, current_location=current_location, plate_number=data[5]).to_dict()
                    else:
                        f.write(line)
                if not found:
                    raise InvalidInputException("Driver ID is not correct")
                return result
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error editing driver: {e}")