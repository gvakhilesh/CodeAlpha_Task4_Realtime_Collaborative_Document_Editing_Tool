# Editflow

**Editflow** allows real-time document editing for collaborative work. Users can create, edit, and share documents that are automatically synced across multiple clients in real-time using **Socket.IO**.


## Installation

### 1. Backend

```bash
cd server
npm install
```
Start the server: npm start
The backend will start on http://localhost:5000.

### 2. Frontend

```bash
cd client
npm install
```
Start the frontend: npm run dev
The frontend will start on http://localhost:5173.

### 3. MongoDB Setup
   Make sure you have MongoDB running either locally or remotely. Update the MongoDB connection string in the backend (server.js):

javascript

```
.connect("Enter the Database URL") 
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
```
