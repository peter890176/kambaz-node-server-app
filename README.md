# Kambaz Learning Management System

A full-stack Learning Management System (LMS) built with Node.js, Express, and MongoDB, featuring a modern React frontend.

## Live Demo

The application is deployed and accessible at: [https://musical-crisp-79946e.netlify.app/](https://musical-crisp-79946e.netlify.app/)

## Features

- User Authentication and Authorization
- Course Management
- Module Organization
- Assignment Handling
- Quiz System
- Enrollment Management
- Session-based Authentication
- CORS Support
- MongoDB Integration

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Express Session for authentication
- CORS for cross-origin requests
- dotenv for environment variables

### Frontend
- React
- Deployed on Netlify

## Project Structure

```
kambaz-node-server-app/
├── Kambaz/
│   ├── Users/
│   ├── Courses/
│   ├── Modules/
│   ├── Assignments/
│   ├── Enrollments/
│   └── Quizzes/
├── index.js
├── package.json
└── .env
```

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   MONGO_CONNECTION_STRING=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   NETLIFY_URL=your_frontend_url
   NODE_ENV=development
   PORT=4000
   ```
4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

The server provides RESTful API endpoints for:
- User management
- Course operations
- Module handling
- Assignment management
- Quiz functionality
- Enrollment processing

## Security Features

- Session-based authentication
- Secure cookie handling
- CORS configuration
- Environment variable protection

## Development

The application uses ES modules and requires Node.js version that supports ES modules. The server runs on port 4000 by default, but can be configured through environment variables.
