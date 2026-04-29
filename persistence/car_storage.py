import os

from utils.exceptions import FileHandlingException, DuplicateUserException

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class CarStorage:
    def __init__(self, car_path = None):
        self.car_path = car_path or os.path.join(BASE_DIR, "data", "car.txt")

    def is_plate_number_exist(self, plate_number):
        try:
            with open(self.car_path, 'r', encoding='utf-8') as f:
                for line in f:
                    if not line.strip():
                        continue
                    db_plate_number = line.strip().split(', ')[0]
                    if db_plate_number == plate_number:
                        return True
                    else:
                        continue
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error reading car file: {e}")

    def get_car_model(self, plate_number: str) -> str | None:
        try:
            with open(self.car_path, 'r', encoding='utf-8') as f:
                for line in f:
                    if not line.strip():
                        continue
                    parts = line.strip().split(', ')
                    if len(parts) >= 2 and parts[0] == plate_number:
                        return parts[1]
            return None
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error reading car file: {e}")

    def add_car(self, plate_number, car_model):
        try:
            plate_number = plate_number.strip()
            car_model = car_model.strip()
            if not self.is_plate_number_exist(plate_number):
                with open(self.car_path, 'a') as f:
                    f.write(f"{plate_number}, {car_model}\n")
            else:
                raise DuplicateUserException(f"Car with plate number {plate_number} already exists.")
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error adding car: {e}")