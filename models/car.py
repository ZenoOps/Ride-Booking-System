class Car:
    def __init__(self, car_model, plate_number):
        self.__plate_number = plate_number
        self.__car_model = car_model

    @property
    def plate_number(self):
        return self.__plate_number

    @property
    def car_model(self):
        return self.__car_model

    def to_dict(self):
        return {
            "plate_number": self.__plate_number,
            "car_model": self.__car_model
        }