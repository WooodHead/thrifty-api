# Thrifty - API

## Contributors

* Lekan Adetunmbi

## About
* This api is built with great consideration regarding security and measure are taken to prevent common attacks such as XSS and CSRF

## Tech Stack

* TypeScript
* Express
* MongoDB
* Mongoose
* Passport-jwt
* JsonWebToken

## Available Routes:

### Base URL 

* [here](https://api-thrifty.herokuapp.com/v1)

#### Authentication Routes
* User Login:                                                   POST    /auth/login
* User Logout:                                                  GET     /auth/logout
* Refresh Token:                                                POST    /auth/refresh_token 

#### User Routes
* Create User:                                                  POST    /user/register
* User Info:                                                    GET     /user/userinfo

#### Password Reset Routes
* Verification Code:                                            GET     /user/verification_code
* Reset Password                                                PUT     /user/reset_password

#### Savings Group Routes
* Get All Savings Group                                         GET     /savings_group/all
* Search Savings Group                                          GET     /savings_group/search
* Get Savings Group by Id                                       GET     /savings_group/:id
* Get Members of a Savings Group                                GET     /savings_group/:id/members
* Create Savings Group                                          POST    /savings_group/create
* Add Member to Savings Group                                   PUT     /savings_group/:id/add_member
* Remove Member from Savings Group                              PUT     /savings_group/:id/remove_member'
* Delete Savings Group                                          DELETE  /savings_group/:id/delete_savings_group'
* Post Send Group Invitation                                    POST    /savings_group/send_group_invitation

#### Savings Group Transaction Routes
* Put Add Savings Group Transaction                             PUT     /savings_group/:id/add_savings
