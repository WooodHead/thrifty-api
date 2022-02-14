# Esusu Confam Test - API

## Contributors

* Lekan Adetunmbi

## About
* This api is built with great consideration regarding security and measure are taken to prevent common attacks such as XSS and CSRF

## Stack

* TypeScript
* Express
* MongoDB
* Mongoose
* Passport
* JWT

## Available Routes:

### Authentication Routes
* User Login:                               POST /api/auth/login
* User Logout:                              GET /api/auth/logout
* Refresh Token:                            POST /api/auth/refresh_token 

### User Routes
* Create User:                              POST /api/user/register
* User Info:                                GET /api/user/userinfo

### Password Reset Routes
* Verification Code:                        GET /api/user/verification_code
* Reset Password                            PUT /api/user/reset_password

### Savings Group Routes
* Get All Savings Group                     GET /api/savings_group/all
* Search Savings Group                      GET /api/savings_group/search
* Get Savings Group by Id                   GET /api/savings_group/:id
* Get Members of a Savings Group            GET /api/savings_group/:id/members
* Create Savings Group                      POST /api/savings_group/create
* Add Member to Savings Group               PUT /api/savings_group/:id/add_member
* Remove Member from Savings Group          PUT /api/savings_group/:id/remove_member'
* Delete Savings Group                      DELETE /api/savings_group/:id/delete_savings_group'
* Post Send Group Invitation                POST /api/savings_group/send_group_invitation

### Endpoint 

* View live demo of the application [here](https://esusu-confam.herokuapp.com/api)
