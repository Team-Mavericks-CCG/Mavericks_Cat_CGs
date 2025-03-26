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

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the server directory**:

   ```bash
   cd server
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Set up the database**:

   - Ensure you have a SQL database set up and update the `dbConfig.js` file with your database connection details.

5. **Run the server**:

   ```bash
   npm start
   ```

## API Endpoints

- **POST /api/login**: Authenticate a user and return a token.
- **POST /api/register**: Register a new user.
- **GET /api/auth/verify** Verify Login Token
