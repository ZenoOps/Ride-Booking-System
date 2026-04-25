class User:
    def __init__(self, user_id, name, user_type):
        self.__user_id = user_id
        self.__name = name
        self.__user_type = user_type

    # Password Field

    # user_id
    @property
    def user_id(self):
        return self.__user_id

    # name
    @property
    def name(self):
        return self.__name

    @name.setter
    def name(self, name):
        self.__name = name

    # user type
    @property
    def user_type(self):
        return self.__user_type