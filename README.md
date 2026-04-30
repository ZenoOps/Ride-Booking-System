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

    User <|-- Rider
    User <|-- Driver

    Trip ..> Driver : driver_id
    Trip ..> Rider : rider_id
    Trip ..> Car : plate_number
    Driver ..> Car : plate_number
    Driver ..> City : current_location
    Session ..> User : user_id
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
