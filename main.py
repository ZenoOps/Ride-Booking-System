from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from controllers.trip_controller import TripController
from controllers.auth_controller import AuthController
from controllers.user_controller import UserController
from utils.exceptions import InvalidInputException

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

auth_controller = AuthController()
user_controller = UserController()
trip_controller = TripController()

base_api = "/api"

# Trip Routes
@app.post(base_api + "/request-ride")
def request_ride(rider_id: str, start_point: str, destination: str):
    ride_request, msg = trip_controller.request_ride(rider_id, start_point, destination)
    if ride_request is None:
        raise HTTPException(status_code=400, detail=msg)
    return {"trip": ride_request.to_dict()}

@app.delete(base_api + "/cancel-ride/{trip_id}")
def cancel_ride(trip_id: str, rider_id: str):
    result, msg = trip_controller.cancel_ride(trip_id, rider_id)
    if result is None:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}

@app.put(base_api + "/respond-ride/{trip_id}")
def respond_to_ride(trip_id: str, action: str):
    result, msg = trip_controller.respond_to_ride(trip_id, action)
    if result is None:
        raise HTTPException(status_code=400, detail=msg)
    return {"trip": result}

@app.get(base_api + "/temp-trip/{trip_id}")
def get_temp_trip_status(trip_id: str):
    trip = trip_controller.get_temp_trip_status(trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Temp trip not found")
    return {"trip": trip}

@app.get(base_api + "/trip/user/{user_id}")
def get_all_trips_by_user(user_id: str, user_type: str):
    try:
        trips = trip_controller.get_trips_by_user(user_id, user_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"trips": trips}

@app.get(base_api + "/trip/{trip_id}")
def get_trip_detail(trip_id: str):
    trip = trip_controller.get_trip_detail(trip_id)
    if not trip.get("success"):
        raise HTTPException(status_code=404, detail=trip.get("message"))
    return {"trip": trip}

@app.put(base_api + "/trip/{trip_id}")
def end_trip(trip_id: str):
    res = trip_controller.end_trip(trip_id)
    if res is None:
        raise HTTPException(status_code=400, detail="Trip not found")
    return {"trip": res}


# Driver-specific Routes
@app.get(base_api + "/driver/{driver_id}/pending-trips")
def get_driver_pending_trips(driver_id: str):
    trips = trip_controller.get_pending_trips_for_driver(driver_id)
    return {"trips": trips}

@app.put(base_api + "/driver/{driver_id}/status")
def update_driver_status(driver_id: str, new_status: str):
    res = user_controller.change_driver_status(driver_id, new_status)
    if res is None:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"driver": res}

@app.put(base_api + "/driver/{driver_id}/location")
def update_driver_location(driver_id: str, new_location: str):
    res = user_controller.change_driver_location(driver_id, new_location)
    if res is None:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"driver": res}

# User Routes
@app.get(base_api + "/{user_type}/{user_id}")
def get_user(user_id: str, user_type: str):
    try:
        res, msg = user_controller.get_user_detail(user_id, user_type)
    except InvalidInputException as e:
        raise HTTPException(status_code=400, detail=str(e))
    if res is None:
        raise HTTPException(status_code=404, detail=msg)
    return {"user": res}

@app.post(base_api + "/{user_type}")
def create_user(user_type: str, name: str, password: str, plate_number: str = None, car_model: str = None):
    session = auth_controller.sign_up(name, password, user_type, plate_number, car_model)
    return {"user": session.to_dict()}

@app.post(base_api + "/{user_type}/signin")
def sign_in(user_type: str, name: str, password: str):
    session = auth_controller.sign_in(name, password, user_type)
    return {"user": session.to_dict()}

@app.post(base_api + "/{user_type}/signout")
def sign_out(user_type: str):
    auth_controller.sign_out()
    return {"message": f"{user_type} signed out"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)