# E-commerce API
This project is a simple application server for an e-commerce app.

This project was inspired by:
https://roadmap.sh/projects/ecommerce-api

## Requirements

Here is a rough list of requirements for this project:
- [ ] Ability for users to sign up and log in.
- [ ] Ability to add products to a cart.
- [ ] Ability to remove products from a cart.
- [ ] Ability to view and search for products.
- [ ] Ability for users to checkout and pay for products.
- [ ] Admin panel to manage products (set prices, add new products, etc.)

## Todo

### General

- [x] Create docker-compose for PostgreSQL, Adminer and Node.js.

### Database
- [ ] Model database diagram on dbdiagram.io.
    - [x] Model user table
- [ ] Create tables in the database using Prisma.
    - [x] Create user table

### Server
#### Config
- [x] Create basic project configuration with TypeScript and Express.
- [x] Add prisma to the project.
- [x] Enable HTTPS in the project (self-signing certificate for development)

#### Login
- [ ] Write unit tests for login functionality (generating token, controller functions, etc.)
- [ ] Implement the login functionality
- [ ] Write integration tests for login API
- [ ] Implement the login API

#### Sign-up
- [x] Write unit tests for sign-up functionality (generating token, controller functions, etc.)
- [x] Implement the sign-up functionality
- [x] Write integration tests for sign-up API
- [x] Implement the sign-up API
