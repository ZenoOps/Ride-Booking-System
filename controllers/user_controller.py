from persistence.user_storage import UserStorage
from utils.exceptions import FileHandlingException

class UserController:
    def __init__(self):
        self.__user_storage = UserStorage()
        self.__riders = self.__user_storage.load_riders()
        self.__drivers = self.__user_storage.load_drivers()

    def get_drivers(self):
        self.__drivers = self.__user_storage.load_drivers()
        return list(self.__drivers)
    def get_riders(self):
        self.__riders = self.__user_storage.load_riders()
        return list(self.__riders)

    def request_ride(self, rider, start_point, destination):
        if rider is None:
            return None, "Ride request failed."
        if not start_point or not destination:
            return None, "Start point and destination are required."
        ride_request = {
            "rider": rider,
            "start_point": start_point,
            "destination": destination,
            "status": "pending",
            "driver": None
        }
        request_message = f"Ride requested successfully."
        return ride_request, request_message

    def find_driver(self, start_point):
        drivers = self.__drivers
        available_drivers = []

        for driver in drivers:
            if not driver.available_status:
                continue
            if driver.current_location is None:
                continue
            if driver.current_location == start_point:
                available_drivers.append(driver)
        if not available_drivers:
            return None, "No available drivers found."

        selected_driver = available_drivers[0]
        driver_message = (f"Driver found successfully.\n"
            f"Driver: {selected_driver.name}\n"
            f"Current Location: {selected_driver.current_location}\n"
            f"Plate Number: {selected_driver.plate_number}")
        return selected_driver, driver_message

    def accept_ride(self, ride_request, driver):
        if ride_request is None:
            return None, "No ride request found."
        if driver is None:
            return ride_request, "No driver found."
        if not driver.available_status:
            return ride_request, "Driver is not available."

        ride_request["driver"] = driver.name
        ride_request["status"] = "accepted"
        driver.available_status = "False"

        self.__user_storage.edit_driver(
            user_id=driver.user_id
        )
        accept_message = f"Ride accepted successfully."
        return ride_request, accept_message

    def change_driver_location(self, driver_id, new_location = None):
        res = self.__user_storage.edit_driver(user_id=driver_id, current_location = new_location)
        return res
    def change_driver_status(self, driver_id, new_status = None):
        res = self.__user_storage.edit_driver(user_id=driver_id, available_status = new_status)
        return res

    def get_user_detail(self, user_id):
        """
        Searches for a user by ID in both the Rider and Driver databases
        and returns a clean dictionary.
        """
        try:
            riders = self.__user_storage.load_riders()
            drivers = self.__user_storage.load_drivers()
            # Convert ID to string once, just in case an int was passed in
            target_id = str(user_id)

            for rider in riders:
                if rider.user_id == target_id:
                    return {
                        "success": True,
                        "user_id": rider.user_id,
                        "name": rider.name,
                        "user_type": rider.user_type  
                    }

            for driver in drivers:
                if driver.user_id == target_id:
                    return {
                        "success": True,
                        "user_id": driver.user_id,
                        "name": driver.name,
                        "user_type": driver.user_type, 
                        "available_status": driver.available_status
                    }

            return {"success": False, "message": "User not found."}

        except FileHandlingException as e:
            return {"success": False, "message": f"Database error: {str(e)}"}
        except Exception as e:
            return {"success": False, "message": "An unexpected system error occurred."}

#Testing
# user_controller = UserController()

#get riders and drivers
# riders = user_controller.get_riders()
#drivers = user_controller.get_drivers()
# index = 2
# try:
#     # rider = riders[index]
#     # print(rider.user_id, rider.name)
#
#     driver = drivers[index]
#     print(driver.user_id, driver.name, driver.available_status, driver.current_location, driver.plate_number)
# except IndexError:
#     print("No rider found.")

#request, find and accept
# try:
#     r = user_controller.get_riders()[0]
#     print("Rider:", r.user_id, r.name)

#     print("\n=== Request Ride ===")
#     request_data, message = user_controller.request_ride(r.name, "Bang Sue", "B")
#     print(message)
#     print(request_data)


#     print("\n=== Find Driver ===")
#     found_driver, d_message = user_controller.find_driver("Bang Sue")
#     print(d_message)

#     if found_driver is not None:
#         print("\n=== Accept Ride ===")
#         accepted_request, a_message = user_controller.accept_ride(request_data, found_driver)
#         print(a_message)
#         print(accepted_request)
#     else:
#         print("Ride cannot be accepted because no driver was found.")

# except IndexError:
#     print("No riders found.")


if __name__ == "__main__":
    uc = UserController()
