# Thrifty - API

## About

This is a fictional financial services provider which offers traditonal financial services and some other value-added services. New customers can open a new account while an existing account holder can perform the following:

* Open single or multiple accounts
* Check their account balance
* Deposit Funds into their Account(s)
* Withdraw Funds from their Account(s)
* Transfer Funds Between Internal Account(s)
* Transfer Funds From their Account(s) to External Accounts
* Make Bill Payments (Airtime top-ups, Cable TV, Data, Electricity, Internet Subscriptions) via a third-party payment provider
* View All their transaction history
* Close their account

Other Value-added Services includes a Contibutory Savings Scheme where users have access to the following services:

* Create Savings Group with the creator becoming the Group Admin
* Group Admins can add or remove group members
* Contribute Funds to the Savings Group


## Authors

- [@greazleay](https://www.github.com/greazleay)


## Tech Stack

**Server:** Node

* [TypeScript](https://www.typescriptlang.org/)
* [NestJS](https://nestjs.com/)
* [PostgreSQL](https://www.postgresql.org/)
* [TypeORM](https://typeorm.io/)
* [Redis](https://redis.io/)
* [Passportjs](https://www.passportjs.org/)
* [Jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
* [Jest](https://jestjs.io/)


## Installation

```bash
  yarn
  # or
  npm install
```

## Running the app

```bash
# development
$ yarn start
  # or
$ npm run start

# watch mode
$ yarn start:dev
  # or
$ npm run start:dev

# production mode
$ yarn start:prod
  # or
$ npm run start:prod
```

## Documentation

Full API Documentation is available [here](https://api-thrifty.herokuapp.com/api-docs)


## API Reference

Some of the available routes are listed below:

#### Authentication Routes

##### Auth Login

```http
  POST /auth/login
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Your Valid Email |
| `password` | `string` | **Required**. Your Valid Password |

##### Auth Logout

```http
  POST /auth/logout
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `access_token`      | `string` | **Required**. Valid Access Token |

##### Auth Refresh Token

```http
  POST /auth/refresh-token
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `cookies`      | `string` | **Required**. Valid Cookie containing refresh token |


#### User Routes

##### Register

```http
  POST /users/register
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Your Valid Email |
| `password` | `string` | **Required**. Password |
| `firstName` | `string` | **Required**. User's first name |
| `lastName` | `string` | **Required**. User's last name |

##### Get User Info

```http
  GET /users/userinfo
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `access_token`      | `string` | **Required**. Valid Access Token |

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

## License

[MIT](https://choosealicense.com/licenses/mit/)


## 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://pollaroid.net/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/siezes)


## Badges

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/tterb/atomic-design-ui/blob/master/LICENSEs)
[![Language](https://img.shields.io/github/languages/count/greazleay/thrifty-api)](https://github.com/greazleay/thrifty-api/)