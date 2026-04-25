import hashlib
import os
from utils.exceptions import FileHandlingException

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100_000)
    return f"{salt.hex()}:{key.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_hex, key_hex = stored_hash.split(':', 1)
        salt = bytes.fromhex(salt_hex)
        key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100_000)
        return key.hex() == key_hex
    except Exception:
        return False

class AuthStorage:
    def __init__(self, driver_path=None, rider_path=None):
        self.driver_path = driver_path or os.path.join(BASE_DIR, "data", "driver.txt")
        self.rider_path = rider_path or os.path.join(BASE_DIR, "data", "rider.txt")

    def _read_all(self, user_type: str) -> list[dict]:
        try:
            records = []
            file_path = self.rider_path
            if user_type == "driver":
                file_path = self.driver_path
            os.makedirs(os.path.dirname(file_path), exist_ok=True)

            if not os.path.exists(file_path):
                return records
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    if not line.strip():
                        continue
                    parts = line.strip().split(', ')
                    record = {
                        "user_id": parts[0],
                        "username": parts[1],
                        "hashed_password": parts[2],
                        "user_type": parts[3],
                    }
                    records.append(record)
            return records
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error reading auth file: {e}")

    def find_by_username(self, username: str, user_type: str) -> dict | None:
        for record in self._read_all(user_type):
            if record['username'] == username:
                return record
        return None

    def username_exists(self, username: str, user_type: str) -> bool:
        return self.find_by_username(username, user_type) is not None

    def create_user(self, user, hashed_password: str) -> None:
        try:
            user_type = user.user_type
            if user_type == "driver":
                with open(self.driver_path, 'a', encoding='utf-8') as f:
                    f.write(f"{user.user_id}, {user.name}, {hashed_password}, {user.user_type}, {user.available_status}, {user.current_location}, {user.plate_number}\n")
            elif user_type == "rider":
                with open(self.rider_path, 'a', encoding='utf-8') as f:
                    f.write(f"{user.user_id}, {user.name}, {hashed_password}, {user.user_type}\n")
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error writing auth file: {e}")
