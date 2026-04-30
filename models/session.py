class Session:
    def __init__(self):
        self._user_id = None
        self._username = None
        self._user_type = None

    @property
    def is_authenticated(self) -> bool:
        return self._user_id is not None

    @property
    def user_id(self) -> str | None:
        return self._user_id

    @property
    def username(self) -> str | None:
        return self._username

    @property
    def user_type(self) -> str | None:
        return self._user_type

    def login(self, user_id: str, username: str, user_type: str) -> None:
        self._user_id = user_id
        self._username = username
        self._user_type = user_type

    def to_dict(self) -> dict:
        return {
            "user_id": self._user_id,
            "username": self._username,
            "user_type": self._user_type,
            "is_authenticated": self.is_authenticated
        }

    def logout(self) -> None:
        self._user_id = None
        self._username = None
        self._user_type = None
