# Uber Clone Backend

This is the backend service for the Uber Clone application. It is built using Node.js, Express, and MongoDB, and provides RESTful API endpoints for user authentication, ride management, routing, and other core functionalities, along with real-time WebSocket communication for tracking and notifications.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt
- **Real-time Communication**: Socket.io
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
- `services/`: Business logic and external service integrations.
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

### Users (`/api/users`)
- `POST /register`: Register a new user
- `POST /login`: Login user
- `GET /profile`: Get user profile (Protected)
- `GET /logout`: Logout user (Protected)

### Riders / Drivers (`/api/riders`)
- `POST /register`: Register a new rider/driver
- `POST /login`: Login rider/driver
- `GET /profile`: Get rider profile (Protected)
- `GET /stats`: Get rider statistics/earnings (Protected)
- `GET /logout`: Logout rider

### Rides (`/api/rides`)
- `POST /create`: Create a new ride request (Protected: User)
- `POST /confirm`: Confirm ride details (Protected: User)
- `POST /accept`: Accept a ride (Protected: Rider)
- `POST /start`: Start an accepted ride (Protected: Rider)
- `POST /end`: Complete an ongoing ride (Protected: Rider)
- `POST /pay`: Handle ride payment (Protected: User)

### Maps & Routing (`/api/map`, `/api/directions`)
- `GET /api/map/search`: Search for locations using autocomplete
- `GET /api/map/get-coordinates`: Geocode an address
- `GET /api/map/distance-time`: Get distance and time between addresses
- `GET /api/map/distance-coordinates`: Get distance and time between coordinates
- `GET /api/directions/`: Get turn-by-turn routing directions (Protected)

## Real-time Events (Socket.io)

The backend uses Socket.io to manage real-time updates between Users and Riders.
- **Connection**: Clients connect to the base URL and emit a `join` event with their `userId` and `userType` to register their socket ID.
- **Location Updates**: Riders emit `update-location-rider` event with their coordinates, which the server relays to users in an active ride via `rider-location-update`.
- **Ride Requests**: Notifications are pushed to nearby riders when a user creates a new ride.

## Database Models

- **User Model**: Stores user details (name, email, password), socket ID.
- **Rider Model**: Stores driver details, vehicle info (type, number, color, capacity), real-time location (using GeoJSON 2dsphere index for quick proximity queries), completed rides history, total earnings, total rides, and socket ID.
- **Ride Model**: Relates User and Rider, stores pickup/dropoff locations, distance, duration, price, vehicle type, OTP (for start verification), and status (`pending`, `confirmed`, `accepted`, `ongoing`, `completed`, `cancelled`).

## License

ISC License
