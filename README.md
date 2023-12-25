# Auth Microservice

## Description

Auth microservice for microservices architecture.

### Created authorization flow ###
Added code: https://github.com/ndmen/auth-microservice/tree/main 

### Added two routes: ###
* POST /auth/signup - Register user
* POST /auth/signin -  Login user 

### Added 4 e2e tests for two routes: ###

### Added logic saving access_token in redis (used ioredis library) with TTL 24 hours (FOR PERFORMANCE) ###
If token exist in redis - return from redis
If token not exist - sign new token

### About scale ###
### What if this service needed to scale to 10,000 user registration requests per second? ###
My response:
* We can use database sharding
* We can use caching
* We can use asynchronous functions (big tasks as email for example delegate to background jobs or queues)
* We can distribute incoming requests across multiple instances

### How about 100,000 user login requests per second? ###
My response:
* We can use redis for returning access token (caching)
* We can use throttling (ThrottlerModule in nest js)
* We can optimize database queries

### How to run application ###
1. Clone code: https://github.com/ndmen/auth-microservice/tree/main 

2. Install packages: yarn install

3. Create file .env.development and copy environments from file .env.example

4. Run in docker container auth, redis and postgres using command: yarn docker:up 
(If will RECONNECT to redis inside docker container (See auth-microservice logs) - run only auth-microservice just through terminal on local machine)

5. Run migrations in database postgres: yarn migration:run

6. Open Swagger: http://localhost:3000/swagger#/auth/authSignUp

7. Run e2e test: yarn test:e2e

## Configuration

### Environment Variables priority:

```text
.env.development.local
.env.development
.env
```

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# development in docker
$ yarn docker:up
$ yarn docker:logs

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
