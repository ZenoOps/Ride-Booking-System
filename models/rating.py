class Rating:
    def __init__(self, trip_id: str, driver_id: str, rider_id: str, rating: int):
        self.__trip_id = trip_id
        self.__driver_id = driver_id
        self.__rider_id = rider_id
        self.__rating = int(rating)

    @property
    def trip_id(self):
        return self.__trip_id

    @property
    def driver_id(self):
        return self.__driver_id

    @property
    def rider_id(self):
        return self.__rider_id

    @property
    def rating(self):
        return self.__rating

    def to_dict(self):
        return {
            "trip_id": self.__trip_id,
            "driver_id": self.__driver_id,
            "rider_id": self.__rider_id,
            "rating": self.__rating,
        }
