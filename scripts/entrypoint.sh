#!/usr/bin/env bash
set -e # exit immediately if command fails

if [ "$NODE_ENV" != "production" ]; then
  npx prisma migrate dev --name init || true  # do not fail if already applied
fi
npx prisma generate
exec "$@"
