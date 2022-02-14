# Esusu Confam Ltd - API

## Contributors

* Lekan Adetunmbi

## About
* This api is built with great consideration regarding security and measure are taken to prevent common attacks such as XSS and CSRF 

## Available Routes:

### Authentication Routes
* User Login:           POST /api/auth/login
* User Logout:          GET /api/auth/logout
* Refresh Token:        POST /api/auth/refresh_token 

### User Routes
* Create User:          POST /api/user/register
* User Info:            GET /api/user/userinfo

### Password Reset
* Verification Code:    GET /api/user/verification_code
* Reset Password        PUT /api/user/reset_password

###
* Create Savings Group           POST /api/posts/create_savings_group
* Get Savings Group              GET /api/posts/get_savings_group
* Get Savings Group by Id        GET /api/posts/get_savings_group_by_id
* Add Member to Savings Group    PUT /api/posts/add_member_to_savings_group
* Delete Savings Group           DELETE /api/posts/delete_savings_group
