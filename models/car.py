class Car:
    def __init__(self, car_model, plate_number):
        self.__plate_number = plate_number
        self.__car_model = car_model

    # plate number
    @property
    def plate_number(self):
        return self.__plate_number

    @plate_number.setter
    def plate_number(self, new_plate_number):
        self.__plate_number = new_plate_number

    # car_model
    @property
    def car_model(self):
        return self.__car_model

    @car_model.setter
    def car_model(self, new_car_model):
        self.__car_model = new_car_model