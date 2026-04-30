# Ride Booking System

Dockerized full-stack ride booking application:
- `backend`: FastAPI service on container port `8000`
- `frontend`: React/Vite app served by Nginx on container port `80`
- `nginx` reverse proxy routes `/api/*` from frontend to backend


## Project Overview
The Ride Booking System is a web-based application that connects riders with available drivers. It uses a Python FastAPI backend with file-based persistence and a React + TypeScript frontend. The system supports user registration, authentication, ride booking with automatic driver assignment, and trip lifecycle management.


## Tech Stack
- Backend: Python 3, FastAPI
- Frontend: React 18, TypeScript, Vite, TailwindCSS
- Storage: Plain text files (CSV format)
- Auth: PBKDF2-SHA256 password hashing


## Project Flow
1. **Authentication**: Users (Riders or Drivers) start by registering or logging into the application.
2. **Ride Request**: An authenticated Rider selects a pickup and drop-off location and requests a ride. The backend verifies the rider and finds an available driver.
3. **Ride Assignment**: A temporary trip is created. The assigned Driver sees this pending ride on their dashboard.
4. **Driver Response**: The Driver can choose to either accept or reject the booking. If accepted, the trip becomes an active ride. If rejected, the Rider is notified, and the temporary trip is canceled.
5. **Ride Completion**: Once the trip is accepted and the ride is ongoing, the Driver has the ability to complete the trip from their dashboard, ending the lifecycle of the ride booking process.
6. **Driver Rating**: After a trip is completed, the Rider can rate the Driver from 1 to 5. Drivers can see their average rating and per-trip ratings.


## System Architecture

```mermaid
graph TD
    subgraph Frontend["Frontend (React + Vite)"]
        Pages["Pages: Login, Signup, Rider, Driver"]
        Lib["Lib: api.ts, storage.ts"]
    end

    subgraph API["FastAPI (main.py)"]
        Routes["Routes: auth, user, driver, trip"]
    end

    subgraph Controllers["Controller Layer"]
        AC["AuthController"]
        UC["UserController"]
        TC["TripController"]
    end

    subgraph Persistence["Persistence Layer"]
        AS["AuthStorage"]
        US["UserStorage"]
        TS["TripStorage"]
        CS["CarStorage"]
        RS["RatingStorage"]
    end

    subgraph Storage["File Storage (data/)"]
        Files["rider.txt · driver.txt · car.txt · trip.txt · temp_trip.txt · rating.txt"]
    end

    Frontend -->|HTTP REST| API
    Routes --> AC
    Routes --> UC
    Routes --> TC
    AC --> AS
    AC --> CS
    UC --> US
    UC --> CS
    TC --> TS
    TC --> US
    TC --> RS
    Controllers --> Persistence
    Persistence --> Storage
```

## Trip Status Flow

```mermaid
flowchart TD
    A["Rider requests ride"] --> B["temp_trip created\nstatus: In Process"]
    B --> C{"Driver response"}
    C -->|Accept| D["temp_trip: accepted\ntrip created: In Process"]
    C -->|Reject| E["temp_trip: rejected\nRider notified"]
    D --> F{"Driver action"}
    F -->|Complete| G["trip: Completed\nAppears in history"]
    E --> H["Rider can book again"]

    style A fill:#4f46e5,color:#fff
    style B fill:#f59e0b,color:#000
    style D fill:#22c55e,color:#fff
    style E fill:#ef4444,color:#fff
    style G fill:#06b6d4,color:#fff
    style H fill:#8b5cf6,color:#fff
```

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

    class Rating {
        -__trip_id
        -__driver_id
        -__rider_id
        -__rating
        +trip_id
        +driver_id
        +rider_id
        +rating
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
    Rating ..> Trip : trip_id
    Rating ..> Driver : driver_id
    Rating ..> Rider : rider_id
    Driver ..> Car : plate_number
    Driver ..> City : current_location
    Session ..> User : user_id
```

## Docker Architecture

- Multi-stage build in [Dockerfile](/home/zeno/Ride-Booking-System/Dockerfile)
- Service orchestration in [docker-compose.yml](/home/zeno/Ride-Booking-System/docker-compose.yml)
- Frontend routing/proxy config in [docker/nginx.conf](/home/zeno/Ride-Booking-System/docker/nginx.conf)
- Persistent backend file storage via named volume `app-data` mounted at `/app/persistence/data`

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
- `rating.txt`

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
