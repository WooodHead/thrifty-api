# Thrifty - API

## Authors

- [@greazleay](https://www.github.com/greazleay)

## About
This is a fictional financial services provider which offers traditonal financial services and some other value-added services. New customers can open a new account while an existing account holder can perform the following:

* Open multiple accounts
* Check their account balance
* Withdraw money from their account
* Close their account

## Tech Stack

* [TypeScript](https://www.typescriptlang.org/)
* [NestJS](https://nestjs.com/)
* [PostgreSQL](https://www.postgresql.org/)
* [TypeORM](https://typeorm.io/)
* [Redis](https://redis.io/)
* [Passportjs](https://www.passportjs.org/)
* [Jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
* [Jest](https://jestjs.io/)

## Endpoints 

* Full API Documentation is available [here](https://api-thrifty.herokuapp.com/api-docs)

## Available Routes:

Some of the available routes are listed below:

### Base URL 

* [here](https://api-thrifty.herokuapp.com/v1)

#### Authentication Routes
* User Login:                                                   POST    /auth/login
* User Logout:                                                  GET     /auth/logout
* Refresh Token:                                                POST    /auth/refresh-token 

#### User Routes
* Create User:                                                  POST    /users/create
* User Info:                                                    GET     /users/userinfo

#### Password Reset Routes
* Verification Code:                                            GET     /users/get-verification-code/:email
* Reset Password                                                PUT     /users/reset-password
* Change Password                                               PUT     /users/change-password
* Delete User account                                           DEL     /users/:id

#### Savings Group Routes
* Get All Savings Group                                         GET     /savings-group/all
* Get Savings Group by name                                     GET     /savings-group/by-name/:name
* Get Savings Group by Id                                       GET     /savings-group/:id
* Get Members of a Savings Group                                GET     /savings-group/:id/members
* Create Savings Group                                          POST    /savings-group/create
* Update Savings Group                                          PATCH   /savings-group/:id
* Delete Savings Group                                          DELETE  /savings-group/:id
* Add Member to Savings Group                                   PATCH   /savings-group/add-group-member
* Remove Member from Savings Group                              PATCH   /savings-group/remove-group-member
* Put Add Savings Group Transaction                             PATCH   /savings-group/contribute-funds
