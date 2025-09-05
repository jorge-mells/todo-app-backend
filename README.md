# Todo App Api

[![JavaScript][javascript-badge]][javascript-url]
[![MySQL][mysql-badge]][mysql-url]
[![Prisma][prisma-badge]][prisma-url]
[![Express][express-badge]][express-url]
[![Vitest][vitest-badge]][vitest-url]
[![CI Lint & Test][lint-test-badge]][lint-test-url]
[![CI Release][release-badge]][release-url]
[![Semantic Release][semantic-badge]][semantic-url]

This project is an attempt at creating a REST Todo App Api to learn skills such as user authentication, databases,
restful app design, basic CRUD operations, dependency management, and basic error handling and security.

It also includes development features such as documentation, metrics exposure, health checking, containerization and
basic CI/CD.

## Getting Started

These instructions will give you a copy of the project up and running on
your local machine for development and testing purposes. See deployment
for notes on deploying the project on a live system.

### Prerequisites

Requirements for the software and other tools to build, test and push 
- [node.js](https://nodejs.org/en/download)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Docker(optional)](https://docs.docker.com/engine/install/)
- [mysql(optional)](https://documentation.ubuntu.com/server/how-to/databases/install-mysql/). Follow the link to install
  on ubuntu

### Installing

> If you don't want to run docker containers make sure you have installed mysql. Then for the root user run the following
> sql commands.
```sql 
CREATE USER 'your_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON *.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```
> ⚠ Note: Granting privileges on `*.*` is only for local development, but I do it everywhere because it is more
> convenient.

Clone the project

    git clone <repo_url>
    cd todo-app-backend

#### Docker Setup

If you are using docker just run the following. Otherwise continue with the next steps.
    
    docker compose build
    docker compose up backend

#### Local Development

Install dependencies

    npm install

Copy .env.example to .env and modify the values accordingly. Use the user and password you created for the db from above
or your own custom values if you are using docker.

    cp .env.example .env

You may need to generate a new prisma client and ensure client is in sync

    npx prisma migrate dev
    npx prisma generate


Start the server with
    
    npm run dev

#### Example

    $ curl localhost:8000/api/v1/healthz
    $ {"message": "successful"}

## Running the tests

### Sample Tests

The project contains a number of tests to check the prisma client and most of the endpoints. To test the project run:

    npm test

### Style test

Checks if the best practices and the right coding style has been used.

    npm run lint

## Deployment

You can deploy the app as a docker container using the following. Otherwise use any other deployment method you are
familiar with or checkout todo-app-devops for a kubernetes deployment to private cloud.

    docker pull ghcr.io/jorge-mells/todo-app-backend:latest

## Built With

  - [MIT License](https://choosealicense.com/licenses/mit/) 

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code
of conduct, and the process for submitting pull requests to us.

## Versioning

We use [Semantic Versioning](http://semver.org/) for versioning. For the versions
available, see the [tags on this
repository](https://github.com/jorge-mells/todo-app-backend/tags).

## Authors

  - **Billie Thompson** - *Provided README Template* -
    [PurpleBooth](https://github.com/PurpleBooth)
  - **Jorge Mells** - *Repo Owner* - [jorge-mells](https://github.com/jorge-mells)

See also the list of
[contributors](https://github.com/jorge-mells/todo-app-backend/contributors)
who participated in this project.

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/) - see the [LICENSE.md](LICENSE.md) file for
details

## Acknowledgments

  - chatgpt, claude, gemini, copilot, meta, deepseek, grok. I used them all :).

## Comments
  - there are several bugs in this, and several inefficiencies. If you are interested, you can take a look.
  - There are several dependencies I used that I shouldn't have, but it's all for learning sake, otherwise any
    other comments are welcome.


[javascript-badge]: https://img.shields.io/badge/JavaScript-ES2022-yellow?logo=javascript&style=flat-square
[javascript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript

[mysql-badge]: https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql&style=flat-square
[mysql-url]: https://www.mysql.com/

[prisma-badge]: https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&style=flat-square
[prisma-url]: https://www.prisma.io/

[express-badge]: https://img.shields.io/badge/Express.js-5.0-black?logo=express&style=flat-square
[express-url]: https://expressjs.com/

[vitest-badge]: https://img.shields.io/badge/Vitest-3.0-6E9F18?logo=vitest&style=flat-square
[vitest-url]: https://vitest.dev/

[lint-test-badge]: https://github.com/jorge-mells/todo-app-backend/actions/workflows/lint-test.yml/badge.svg
[lint-test-url]: https://github.com/jorge-mells/todo-app-backend/actions/workflows/lint-test.yml

[release-badge]: https://github.com/jorge-mells/todo-app-backend/actions/workflows/release.yml/badge.svg
[release-url]: https://github.com/jorge-mells/todo-app-backend/actions/workflows/release.yml

[semantic-badge]: https://img.shields.io/badge/semver-2.0.0-blue?style=flat-square
[semantic-url]: https://github.com/semantic-release/semantic-release
