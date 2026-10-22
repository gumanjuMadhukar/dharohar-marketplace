#!/bin/bash
docker-compose exec -T backend php artisan migrate --force
docker-compose exec -T backend php artisan db:seed --force

