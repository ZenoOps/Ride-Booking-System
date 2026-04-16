
class Trip:
    def __init__(self, rider, driver, car):
        self.rider = rider
        self.driver = driver
        self.car = car
        self.status = "Created"

    def start_trip(self):
        self.status = "Started"

    def end_trip(self):
        self.status = "Completed"