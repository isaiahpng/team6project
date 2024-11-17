# Team 6 Inventory Management System

A full-stack inventory management system built with React and Node.js.

## Features

- Real-time inventory tracking
- Add, edit, and delete inventory items
- Low stock notifications
- Order management
- User-friendly interface
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/team6project.git
cd team6project
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
PORT=3001
```

4. Start the development server:
```bash
# Run frontend and backend together
npm run dev

# Or run them separately:
npm start          # Frontend
npm run start-backend  # Backend
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

1. Create a MySQL database named `inventory_db`
2. Import the SQL schema from `SQLFiles/schema.sql`
3. (Optional) Import sample data from `SQLFiles/sample_data.sql`

## Available Scripts

- `npm start` - Start the React frontend
- `npm run start-backend` - Start the Node.js backend
- `npm run dev` - Start both frontend and backend
- `npm test` - Run tests
- `npm run build` - Build for production

## Tech Stack

- Frontend:
  - React
  - Material-UI
  - React Router
- Backend:
  - Node.js
  - Express
  - MySQL
  - WebSocket
- Development:
  - npm
  - nodemon
  - concurrently

## Project Structure

```
team6project/
├── backend/           # Backend server files
│   ├── server.js     # Main server file
│   └── utils/        # Utility functions
├── src/              # Frontend React files
├── public/           # Static files
└── SQLFiles/         # Database schemas and queries
```

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License.
