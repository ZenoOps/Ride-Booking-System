from persistence.auth_storage import AuthStorage, hash_password, verify_password
from models.session import Session
from models.driver import Driver
from models.rider import Rider
from utils.exceptions import InvalidCredentialsException, DuplicateUserException, InvalidInputException
from utils.uuid_generators import UuidGenerator

VALID_USER_TYPES = {"rider", "driver"}

class AuthController:
    def __init__(self, storage=None):
        self.__storage = storage or AuthStorage()
        self.__session = Session()

    def sign_up(self, username: str, password: str, user_type: str, plate_number = None ) -> Session:
        if user_type not in VALID_USER_TYPES:
            raise InvalidInputException(f"Invalid user type: {user_type}")
        if self.__storage.username_exists(username, user_type):
            raise DuplicateUserException(f"Username '{username}' is already taken")

        user_id = str(UuidGenerator.generate_trip_uuid())

        if user_type == "driver":
            user = Driver(user_id=user_id, name=username, plate_number=plate_number)
        else:
            user = Rider(user_id=user_id, name=username)

        self.__storage.create_user(user, hash_password(password))
        self.__session.login(user.user_id, user.name, user.user_type)
        return self.__session

    def sign_in(self, username: str, password: str, user_type: str) -> Session:
        if user_type not in VALID_USER_TYPES:
            raise InvalidInputException(f"Invalid user type: {user_type}")
        record = self.__storage.find_by_username(username, user_type)
        if record is None or not verify_password(password, record['hashed_password']):
            raise InvalidCredentialsException("Invalid username or password")
        self.__session.login(record['user_id'], record['username'], record['user_type'])
        return self.__session

    def sign_out(self) -> None:
        self.__session.logout()

    def get_session(self) -> Session:
        return self.__session
