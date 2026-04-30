# syntax=docker/dockerfile:1

FROM python:3.12-slim AS backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY controllers ./controllers
COPY models ./models
COPY persistence ./persistence
COPY utils ./utils

EXPOSE 8000

CMD ["sh", "-c", "mkdir -p /app/persistence/data && touch /app/persistence/data/rider.txt /app/persistence/data/driver.txt /app/persistence/data/car.txt /app/persistence/data/trip.txt /app/persistence/data/temp_trip.txt /app/persistence/data/rating.txt && uvicorn main:app --host 0.0.0.0 --port 8000"]


FROM node:20-alpine AS frontend-build

WORKDIR /app/views

COPY views/package*.json ./
RUN npm ci --ignore-scripts && npm rebuild esbuild

COPY views/ ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build


FROM nginx:1.27-alpine AS frontend

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/views/dist /usr/share/nginx/html

EXPOSE 80
