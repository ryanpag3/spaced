# Spaced

Spaced is a modern media sharing platform that allows users to securely store, organize, and share their photos and videos. The application features a responsive mobile interface and a robust API backend.

## Project Structure

The project is organized into two main modules:

### API (Backend)

The backend is built with NestJS and uses Prisma ORM for database interactions. It consists of the following modules:

- **Auth**: Handles user authentication, login, and registration
- **Users**: Manages user profiles, settings, and account information
- **Media**: Processes and stores media files (images, videos)
- **Post**: Manages user posts, comments, and reactions
- **S3**: Handles cloud storage integration for media files
- **Common**: Contains shared utilities, middleware, and common functionality
- **DB**: Database connections and configurations

### Mobile (Frontend)

The mobile application is built using React Native with Expo. It consists of the following modules:

- **API**: Contains API clients for interacting with the backend
- **Components**: Reusable UI components
- **Services**: Core business logic services including authentication and media handling
- **Lib**: Utility functions for cryptography and authentication
- **Constants**: Application-wide constants and theme configuration
- **Assets**: Static resources like images and fonts

## Development

The project uses Docker for containerization and TypeScript for type safety across both frontend and backend. The database schema is managed through Prisma migrations.