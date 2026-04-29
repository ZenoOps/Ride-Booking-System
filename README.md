# Ride Booking System

Dockerized full-stack ride booking application:
- `backend`: FastAPI service on container port `8000`
- `frontend`: React/Vite app served by Nginx on container port `80`
- `nginx` reverse proxy routes `/api/*` from frontend to backend

## Docker Architecture

- Multi-stage build in [Dockerfile](/home/zeno/Ride-Booking-System/Dockerfile)
- Service orchestration in [docker-compose.yml](/home/zeno/Ride-Booking-System/docker-compose.yml)
- Frontend routing/proxy config in [docker/nginx.conf](/home/zeno/Ride-Booking-System/docker/nginx.conf)
- Persistent backend file storage via named volume `app-data` mounted at `/app/persistence/data`

## UML Class Diagram

This diagram focuses on the backend Python class structure. The React frontend uses these classes indirectly through the FastAPI routes in `main.py`.

```mermaid
classDiagram
    direction LR

    class User {
        -_user_id
        -_name
        -_password
        +user_id
        +name
        +password
        +to_dict()
    }

    class Rider {
        +user_type
        +to_dict()
    }

    class Driver {
        -__available_status
        -__current_location
        -__plate_number
        +user_type
        +available_status
        +current_location
        +plate_number
        +to_dict()
    }

    class Car {
        -__plate_number
        -__car_model
        +plate_number
        +car_model
        +to_dict()
    }

    class Trip {
        -__trip_id
        -__driver_id
        -__rider_id
        -__plate_number
        -__start_point
        -__destination
        -__status
        +trip_id
        +driver
        +rider
        +car
        +start_point
        +destination
        +status
        +to_dict()
    }

    class Session {
        -_user_id
        -_username
        -_user_type
        +is_authenticated
        +user_id
        +username
        +user_type
        +login(user_id, username, user_type)
        +logout()
        +to_dict()
    }

    class City {
        -__city_id
        -__city_name
        +city_id
        +city_name
    }

    class AuthController {
        -__storage
        -__car_storage
        -__session
        +sign_up(username, password, user_type, plate_number, car_model)
        +sign_in(username, password, user_type)
        +sign_out()
        +get_session()
    }

    class UserController {
        -__user_storage
        -__car_storage
        -__valid_user_types
        +get_user_detail(user_id, user_type)
        +find_available_driver(start_point)
        +change_driver_location(driver_id, new_location)
        +change_driver_status(driver_id, new_status)
    }

    class TripController {
        -__validate_user_type
        -__user_controller
        -__trip_storage
        -__user_storage
        +start_trip(driver_id, rider_id, plate_number, start_point, destination)
        +end_trip(trip_id)
        +cancel_ride(trip_id, rider_id)
        +get_pending_trips_for_driver(driver_id)
        +get_trip_detail(trip_id)
        +get_trips_by_user(user_id, user_type)
        +request_ride(rider_id, start_point, destination)
        +respond_to_ride(trip_id, action)
    }

    class AuthStorage {
        +driver_path
        +rider_path
        -_read_all(user_type)
        +find_by_username(username, user_type)
        +username_exists(username, user_type)
        +create_user(user, hashed_password)
    }

    class UserStorage {
        +rider_path
        +driver_path
        +load_riders()
        +load_drivers()
        +save_riders(riders)
        +save_drivers(drivers)
        +edit_driver(user_id, available_status, current_location)
    }

    class TripStorage {
        -__file_path
        +temp_file_path
        -__parse_trip(data)
        +create_temp_trip(trip_obj)
        +get_temp_trip(trip_id)
        +edit_temp_trip(trip_id, status)
        +delete_temp_trip(trip_id)
        +get_temp_trips_by_driver(driver_id)
        +create_trip(trip_obj)
        +edit_trip(trip_id)
        +get_all_trip(user_id, user_type)
        +get_trip_by_id(trip_id)
    }

    class CarStorage {
        +car_path
        +is_plate_number_exist(plate_number)
        +get_car_model(plate_number)
        +add_car(plate_number, car_model)
    }

    class CityStorage

    class UuidGenerator {
        +generate_trip_uuid()
    }

    class FileHandlingException
    class InvalidInputException
    class DuplicateUserException
    class TripNotFoundException
    class InvalidCredentialsException
    class NoAvailableDriverException
    class Exception

    User <|-- Rider
    User <|-- Driver

    Trip ..> Driver : driver_id
    Trip ..> Rider : rider_id
    Trip ..> Car : plate_number
    Trip ..> UuidGenerator : creates id

    AuthController *-- AuthStorage
    AuthController *-- CarStorage
    AuthController *-- Session
    AuthController ..> Driver : creates
    AuthController ..> Rider : creates
    AuthController ..> UuidGenerator : creates ids

    UserController *-- UserStorage
    UserController *-- CarStorage

    TripController *-- TripStorage
    TripController *-- UserStorage
    TripController *-- UserController
    TripController ..> Trip : creates

    AuthStorage ..> Driver : persists
    AuthStorage ..> Rider : persists
    UserStorage ..> Driver : loads and edits
    UserStorage ..> Rider : loads
    TripStorage ..> Trip : parses and writes
    CarStorage ..> Car : stores car records

    Exception <|-- FileHandlingException
    Exception <|-- InvalidInputException
    Exception <|-- DuplicateUserException
    Exception <|-- TripNotFoundException
    Exception <|-- InvalidCredentialsException
    Exception <|-- NoAvailableDriverException
```

## Prerequisites

- Docker Engine
- Docker Compose (`docker compose`)

## Build and Run

Build and start services:

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
```

Stop services:

```bash
docker compose down
```

Stop and remove volume data:

```bash
docker compose down -v
```

## Access URLs

- Frontend: `http://localhost:${FRONTEND_PORT}` (default `http://localhost:3000`)
- Backend API docs: `http://localhost:${BACKEND_PORT}/docs` (default `http://localhost:8000/docs`)

## Verify Environment Variables in Containers

Backend:

```bash
docker compose exec -T backend env
```

Frontend:

```bash
docker compose exec -T frontend env
```

## Data Persistence

Backend creates and uses these files inside `/app/persistence/data`:
- `rider.txt`
- `driver.txt`
- `car.txt`
- `trip.txt`
- `temp_trip.txt`

These files are persisted in Docker volume `app-data`.

## Common Operations

Rebuild after changing frontend `VITE_*` values:

```bash
docker compose up -d --build frontend
```

View logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

Restart one service:

```bash
docker compose restart backend
docker compose restart frontend
```

## Troubleshooting

- Port already in use:
  - Change `BACKEND_PORT` or `FRONTEND_PORT`, then run `docker compose up -d`.
- Frontend cannot reach API:
  - Ensure `VITE_API_BASE_URL=/api` and rebuild frontend image.
  - Confirm backend health: `docker compose ps` and `docker compose logs backend`.
- Changed code not reflected:
  - Rebuild images: `docker compose up -d --build`.
