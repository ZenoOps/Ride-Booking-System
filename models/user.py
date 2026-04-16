class User:
    def __init__(self, user_id, name, type):
        self.__user_id = user_id
        self.__name = name
        self.__type = type

    # user_id
    @property
    def user_id(self):
        return self.__user_id

    @user_id.setter
    def user_id(self, new_user_id):
        self.__user_id = new_user_id

    # name
    @property
    def name(self):
        return self.__name

    @name.setter
    def name(self, name):
        self.__name = name