# Team 6 Point of Sale System

Modern POS web app with inventory management, loyalty rewards, and admin-grade reporting. Built with React 18 on the frontend and an Express/MySQL API secured by JWT.

## Why it stands out
- End-to-end commerce flow: browse inventory, add to cart, checkout, view order history.
- Role-aware UX: shoppers and admins get tailored navigation, inventory controls, and notifications.
- Data-driven decisions: stored-procedure-backed reports (revenue by month, category sales, item quantity/revenue, customer histories).
- Loyalty built in: customer profiles, tiers, and points tracking.
- Deployment proven: frontend hosted on Netlify; backend configured for a Render base URL and easily pointed to local.

## Tech stack
- Frontend: React 18, react-router-dom, axios.
- Backend: Node/Express, MySQL (mysql2), JWT, bcrypt, CORS.
- Tooling: react-scripts, axios instance for shared base URL and auth headers.

## Project structure
- `src/` – React app, pages, and shared utilities (`src/utils/axios.js` controls API base URL).
- `backend/` – Express API (routes, controllers, MySQL pool in `backend/utils/db.js`).
- `SQLFiles/` – Stored procedures used for reporting; pair these with your MySQL schema/tables.

## Environment
Create `backend/.env`:
```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=replace-with-a-long-random-string
PORT=3001
```

If you want the frontend to hit your local API instead of the hosted URL, update `src/utils/axios.js`:
```js
export const axios = defaultAxios.create({
  baseURL: "http://localhost:3001/api",
});
```

## Install & run locally
From repo root:
```
npm install
cd backend && npm install
```

Start backend (terminal 1):
```
cd backend
node server.js
```

Start frontend (terminal 2 from repo root):
```
npm start
```
- Frontend: http://localhost:3000  
- API: http://localhost:3001/api

## Key API routes
- `POST /api/user/signup` – create user + customer profile.
- `POST /api/user/login` – JWT login; `POST /api/user/verify` validates token.
- `GET /api/inventory` – paginated inventory; `POST /api/inventory` (auth) to add; `PUT/DELETE /api/inventory/:id` (auth) to update/remove.
- `GET /api/inventory/images`, `/api/inventory/tag` – helpers for UI.
- `GET/POST /api/cart` – fetch cart or add item; `PUT/DELETE /api/cart/items/:productId`; `POST /api/cart/checkout`.
- `GET /api/notification` – user notifications; `/admin` for admin notifications.
- `GET /api/report/*` – admin reports (quantity/revenue, sales by month, category sales, and order history endpoints).

## What recruiters should know
- Real JWT auth with bcrypt hashing and role checks.
- React hooks-based UI with lightweight state management; axios instance centralizes headers/base URL.
- DB-aware: stored procedures under `SQLFiles/Stored Procedures (Reports)` illustrate back-of-house reporting comfort.
- Clear separation: routes → controllers → MySQL pool; frontend → axios client → components.

## Original quick-start notes (kept for reference)
### These steps only need to be done once, install Node.js and then run in the terminal (command prompt):
1. Navigate to the project directory `cd team6project`
2. `npm install -g npm`
3. `npm install express`
4. `npm install mysql` 

### Start the React App with the following steps:
1. Run in the terminal, `cd team6project`
2. `node server.js` Starts the database
3. Then open the React App https://team6possystem.netlify.app/

### OR* to run locally
3. Open a new terminal window and navigate to the project directory `cd team6project`
4. `npm start` Starts the React App!

## Useful commands
- `npm start` – run the React dev server.
- `cd backend && node server.js` – start the Express API.
- `npm run build` – production build of the frontend.
