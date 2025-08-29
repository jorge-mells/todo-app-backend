#!/usr/bin/env bash

read -p "enter db name: " db
mysql -p -e "drop database ${db};"

rm -rf src/migrations/*

DATABASE_URL="mysql://jorge:integration1@localhost:3306/${db}" npx prisma migrate dev --name init
