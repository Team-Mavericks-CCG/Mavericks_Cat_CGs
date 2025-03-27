# Login Demo Application - Server

This is the server-side of the Login Demo Application built with Node.js, Express, and SQL. The server handles authentication and user management.

## Project Structure

- **src/**: Contains the source code for the server.
  - **app.js**: Entry point of the application, sets up the Express server and middleware.
  - **controllers/**: Contains the authentication controller for handling login and registration requests.
    - **authController.js**: Functions for processing authentication requests.
  - **models/**: Contains the data models for the application.
    - **userModel.js**: Defines the user schema for the SQL database.
  - **routes/**: Contains the route definitions for the application.
    - **authRoutes.js**: Defines routes for authentication-related operations.
  - **config/**: Contains configuration files.
    - **dbConfig.js**: Database connection settings.

## Getting Started

1. **Navigate to the server directory**:

   ```bash
   cd server
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up the database**:

   - Ensure that you have postgres installed and running

4. **Populate .env**

   - Ensure .env exists in the server/src directory
   - Populate .env

   ```env
   DB_NAME=<name of database>
   DB_USER=<user with correct permissions>
   DB_PASSWORD=<password for database>
   DB_HOST=localhost
   JWT_SECRET=<some random string>
   ```

   > [!CAUTION]
   > The example above assumes you are configuring for testing, ensure the JWT_SECRET is long, secure, and random for production and database configuration will likely be different

5. **Run the server**:

   ```bash
   npm start
   ```

## API Endpoints

- **POST /api/login**: Authenticate a user and return a token.
- **POST /api/register**: Register a new user.
- **GET /api/auth/verify** Verify Login Token
- **GET /api/auth/test** test if auth middleware is working
