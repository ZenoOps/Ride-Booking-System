import os

from models.rating import Rating
from utils.exceptions import DuplicateUserException, FileHandlingException

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class RatingStorage:
    def __init__(self, rating_path=None):
        self.rating_path = rating_path or os.path.join(BASE_DIR, "data", "rating.txt")

    def __ensure_file(self):
        os.makedirs(os.path.dirname(self.rating_path), exist_ok=True)
        if not os.path.exists(self.rating_path):
            open(self.rating_path, "a", encoding="utf-8").close()

    def __parse_rating(self, data):
        return Rating(
            trip_id=data[0],
            driver_id=data[1],
            rider_id=data[2],
            rating=int(data[3]),
        ).to_dict()

    def get_all_ratings(self):
        try:
            self.__ensure_file()
            ratings = []
            with open(self.rating_path, "r", encoding="utf-8") as file:
                for line in file:
                    if not line.strip():
                        continue
                    data = [part.strip() for part in line.strip().split(",")]
                    if len(data) >= 4:
                        ratings.append(self.__parse_rating(data))
            return ratings
        except (OSError, IOError, ValueError) as e:
            raise FileHandlingException(f"Error loading ratings: {e}")

    def get_rating_by_trip_id(self, trip_id):
        target_id = str(trip_id)
        for rating in self.get_all_ratings():
            if rating["trip_id"] == target_id:
                return rating
        return None

    def get_ratings_by_driver(self, driver_id):
        target_id = str(driver_id)
        return [rating for rating in self.get_all_ratings() if rating["driver_id"] == target_id]

    def create_rating(self, rating_obj):
        try:
            self.__ensure_file()
            if self.get_rating_by_trip_id(rating_obj.trip_id):
                raise DuplicateUserException("Trip already has a driver rating.")
            with open(self.rating_path, "a", encoding="utf-8") as file:
                file.write(
                    f"{rating_obj.trip_id}, {rating_obj.driver_id}, {rating_obj.rider_id}, {rating_obj.rating}\n"
                )
            return rating_obj.to_dict()
        except DuplicateUserException:
            raise
        except (OSError, IOError) as e:
            raise FileHandlingException(f"Error creating rating: {e}")

    def get_driver_rating_summary(self, driver_id):
        ratings = self.get_ratings_by_driver(driver_id)
        if not ratings:
            return {"average_rating": None, "rating_count": 0}
        total = sum(rating["rating"] for rating in ratings)
        return {
            "average_rating": round(total / len(ratings), 2),
            "rating_count": len(ratings),
        }
