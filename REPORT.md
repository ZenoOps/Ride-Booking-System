# Ride Booking System Report

## System Design Explanation

The Ride Booking System is a full-stack application for registering riders and drivers, requesting rides, accepting or rejecting ride requests, and tracking trip history. The backend is built with FastAPI and exposes the application through `/api` routes in `main.py`. The frontend is a React/Vite application that is built into static assets and served by Nginx. In the Docker deployment, Nginx also proxies `/api` requests from the frontend container to the backend container, so the browser can use one frontend origin while still reaching the API.

The backend follows a simple layered design. FastAPI routes act as the entry point and translate HTTP requests into method calls on controller classes. The controller layer contains the main business logic, such as signing users in, creating ride requests, matching available drivers, accepting rides, ending trips, and returning enriched trip details. The model layer defines the core domain objects: users, riders, drivers, cars, trips, sessions, and cities. The persistence layer stores and retrieves records from plain text files under `persistence/data`.

The Docker setup keeps the system deployable as two main services. The backend service runs the FastAPI application on port `8000`. The frontend service serves the built React app on port `80`, mapped to host port `3000` by default. A named Docker volume, `app-data`, is mounted at `/app/persistence/data` so backend text-file data survives container restarts and rebuilds. This design is lightweight and easy to run locally while still separating frontend hosting, backend API execution, and persistent application data.

## Classes and Relationships

The main inheritance relationship is in the user model. `User` is the base class for shared user fields such as `user_id`, `name`, and `password`. `Rider` extends `User` and represents customers who request rides. `Driver` also extends `User` and adds driver-specific state, including availability, current location, and plate number. A `Car` stores the plate number and car model, and a driver's plate number links the driver to the car record.

`Trip` represents the ride lifecycle. It stores the trip ID, driver ID, rider ID, plate number, start point, destination, and status. It does not directly embed `Driver`, `Rider`, or `Car` objects; instead, it stores identifiers that are resolved through storage and controller methods. This keeps trip records simple enough to serialize into text files, but it means the controllers must enrich trip responses with readable values such as driver name, rider name, and car model.

The controller classes coordinate the model and storage classes. `AuthController` uses `AuthStorage`, `CarStorage`, `Session`, `Rider`, `Driver`, and `UuidGenerator` to register and authenticate users. When a driver signs up, the controller also stores the car information. `UserController` uses `UserStorage` and `CarStorage` to load rider or driver details, find available drivers, update driver location, and update driver availability. `TripController` uses `TripStorage`, `UserStorage`, and `UserController` to create temporary ride requests, accept or reject those requests, create completed trip records, cancel rides, return pending trips for a driver, and return trip history for a rider or driver.

The storage classes isolate file operations. `AuthStorage` reads and writes rider and driver authentication records. `UserStorage` loads and edits rider and driver profile data. `CarStorage` manages car records by plate number. `TripStorage` manages active and historical trip data through `temp_trip.txt` and `trip.txt`. Utility classes and exceptions support these layers: `UuidGenerator` creates unique IDs, while custom exceptions such as `FileHandlingException`, `InvalidInputException`, and `DuplicateUserException` make error cases clearer.

## Challenges Faced

One challenge was keeping relationships consistent while using plain text files instead of a relational database. Trip records store IDs and plate numbers, while driver and car records live in separate files. If the data in those files is not fully aligned, direct lookups can fail or return incomplete information. The code handles this by resolving display values such as driver name and car model through the controller and storage layer, with fallback behavior where needed.

Another challenge was managing driver availability across the ride lifecycle. A driver can be available, receive a temporary ride request, accept it, become unavailable during the active trip, and become available again when the trip ends. This requires `TripController`, `TripStorage`, and `UserStorage` to work together so the trip status and driver status remain synchronized.

The Docker deployment also introduced configuration concerns. The frontend is built with Vite, so `VITE_*` values are build-time inputs, while backend environment variables are runtime inputs. The Compose setup must therefore pass frontend build arguments, runtime environment variables, backend environment variables, and persistent volume configuration in the correct places. The Nginx `/api` proxy also needs to match the API route prefix used by FastAPI.

Finally, file-based persistence is simple but has limitations. Text files are easy to inspect and lightweight for a small project, but they require careful parsing, consistent delimiters, and manual handling of missing or malformed records. A future version could replace the text files with a database to improve consistency, querying, validation, and concurrent writes.
