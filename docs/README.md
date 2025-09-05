# TODO API Documentation

## Quick Links
- [Interactive API Docs](http://localhost:8000/api/v1/api-docs) - Swagger UI
- [OpenAPI Spec (JSON)](http://localhost:8000/api/v1/api-docs.json)
- [OpenAPI Spec (YAML)](http://localhost:8000/api/v1/api-docs.yaml)

## Getting Started
1. Start the server: `npm start`
2. Visit http://localhost:8000/api/v1/api-docs
3. Use the "Try it out" buttons to test endpoints

## Authentication
Most endpoints require a Bearer token. Get one by calling `/api/v1/auth/login` first or `/api/v1/register` if you don't have a username.
