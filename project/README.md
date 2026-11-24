# FeedbackHub — Feedback Management System

FeedbackHub is a React + TypeScript feedback portal with customer and administrator areas. The application uses MongoDB Atlas through a Node.js/Express API.

## Technology stack
- React 18, TypeScript, Vite
- Tailwind CSS, React Router, Recharts, Lucide React
- Node.js, Express.js
- MongoDB Atlas, Mongoose
- JWT authentication and bcrypt password hashing

## Prerequisites
- Node.js 18+
- MongoDB Atlas account and database user

## Setup

1. Install dependencies from the project root:
   ```bash
   npm install
   ```
2. Create a MongoDB Atlas cluster. In Atlas, create a database user and allow your development IP address in Network Access.
3. Copy `server/.env.example` to `server/.env`. Replace `MONGODB_URI` with the Atlas connection string, URL-encode special characters in the database password, and set unique long values for `JWT_SECRET` and `ADMIN_SECRET`.
4. Copy `.env.example` to `.env` (the default API URL works for local development).
5. Create demo accounts and starter products:
   ```bash
   npm run seed
   ```
6. Start the API and frontend together:
   ```bash
   npm run dev:all
   ```
   Frontend: http://localhost:5173  |  API: http://localhost:5000/api  |  Health: http://localhost:5000/api/health

Alternatively, start them separately with `npm run server` and `npm run dev` in two terminals.

## Demo login
- Admin: `admin@demo.com` / `Admin@123`
- Customer: `customer@demo.com` / `Customer@123`

Change the demo passwords with `DEMO_ADMIN_PASSWORD` and `DEMO_CUSTOMER_PASSWORD` in `server/.env` before running the seed script. The seed script updates the demo account passwords each time it runs.

## Admin registration
The public registration form always creates a customer account unless the correct `ADMIN_SECRET` from `server/.env` is supplied through the admin registration form. Never expose `ADMIN_SECRET`, `MONGODB_URI`, or `JWT_SECRET` in frontend environment variables.

## MongoDB collections
- `users`: user profile, email, hashed password, role
- `products`: product name, description, timestamps
- `feedback`: author, product, type, rating, comment, category, sentiment, status, admin reply, timestamp

## Security notes
- MongoDB credentials and JWT signing secrets stay in `server/.env`, never in Vite `VITE_` variables.
- Passwords are hashed with bcrypt; authentication uses signed JWTs.
- Customers can only read their own feedback and cannot manage products or update feedback status.
- Admin-only operations are enforced by the Express API, not just hidden in the UI.
- Use a strong unique JWT secret and admin registration code for any deployment. Restrict Atlas Network Access to trusted IPs for production.

## Build and checks
```bash
npm run typecheck
npm run lint
npm run build
```
