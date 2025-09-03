#!/usr/bin/env bash
# this script is now unecessary since every environment is limited to one db.

read -p "enter db name: " db
mysql -p -e "drop database ${db};"

rm -rf src/migrations/*

# my first secret leak. I'm so proud :). Thanks chatgpt(it's my fault).
# check the first few commits if you want to see it.
npx prisma migrate dev --name init
