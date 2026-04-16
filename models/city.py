class City:
    def __init__(self, city_id, city_name):
        self.__city_id = city_id
        self.__city_name = city_name

    # city_id
    @property
    def city_id(self):
        return self.__city_id

    @city_id.setter
    def city_id(self, new_city_id):
        self.__city_id = new_city_id

    # city_name
    @property
    def city_name(self):
        return self.__city_name

    @city_name.setter
    def city_name(self, new_city_name):
        self.__city_name = new_city_name