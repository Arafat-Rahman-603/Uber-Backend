# Uber Clone Backend

This is the backend service for the Uber Clone application. It is built using Node.js, Express, and MongoDB, and provides RESTful API endpoints for user authentication, ride management, and other core functionalities.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt
- **Other Key Dependencies**:
  - `cors` for Cross-Origin Resource Sharing
  - `dotenv` for environment variable management
  - `express-validator` for API request validation
  - `cookie-parser` for parsing cookies
  - `axios` for HTTP requests

## Project Structure

The project has the following main directories:
- `controllers/`: Handles the logic for API endpoints.
- `models/`: Mongoose schemas and models for database interaction.
- `routes/`: Express router definitions.
- `middlewares/`: Custom middleware functions (e.g., authentication, error handling).
- `services/`: Business logic and external service integrations (if any).
- `validation/`: Request validation logic.
- `db/`: Database connection configuration.

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- MongoDB instance running locally or a MongoDB Atlas URI.

### Installation

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root of the `Backend` directory and define the following environment variables. An example configuration might look like:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
# Add other necessary keys based on your app's requirements
```

### Running the Application

To start the server in development mode using nodemon:

```bash
npm run dev
```

To start the server in production mode:

```bash
npm start
```

## API Endpoints Overview
*(Note: Refer to specific route files for a complete list of endpoints and required payloads)*
- **Authentication**: Endpoints for user/driver registration and login.
- **Rides**: Endpoints for requesting, accepting, and managing ride status.
- **Users**: Endpoints for managing user profiles.

## License

ISC License
