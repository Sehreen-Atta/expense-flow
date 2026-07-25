# ExpenseFlow

A full-stack MERN (MongoDB, Express, React, Node.js) application for tracking personal expenses. Features a modern dark-mode dashboard with dynamic charts and complete CRUD functionality.

## Tech Stack

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- CORS & Dotenv

**Frontend:**
- React (Vite)
- Tailwind CSS
- Axios for API requests
- Recharts for data visualization
- Lucide React for icons

## Setup Instructions

### 1. Backend Setup

Open a terminal and navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Configure Environment Variables:
Copy `.env.example` to `.env` and ensure your `MONGO_URI` is correct.
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.../expenseflow?retryWrites=true&w=majority
PORT=5000
```

Start the backend server:
```bash
npm run dev
```
The server will run on `http://localhost:5000`.

### 2. Frontend Setup

Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```
The application will open in your browser, typically at `http://localhost:5173`.
