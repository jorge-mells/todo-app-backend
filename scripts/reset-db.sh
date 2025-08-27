#!/usr/bin/env bash

mysql -p -e 'drop database todo_db'

rm -rf src/migrations/*

npx prisma migrate dev --name init
