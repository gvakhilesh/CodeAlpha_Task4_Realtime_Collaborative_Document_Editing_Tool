const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");
const Document = require("./Document"); // Assuming you have a Document model

const app = express();

// CORS setup to allow the React frontend to access the backend
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL (React running on port 5173)
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials (like cookies)
  })
);

// MongoDB connection
mongoose
  .connect("enter your database URL here") 
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.IO setup
const io = socketIo(3001, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL (React running on port 5173)
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials (like cookies)
  },
});

const defaultValue = ""; // Default document content if document doesn't exist

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle when the client requests to get a document
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId); // Join a room based on document ID
    socket.emit("load-document", document.data); // Send current document data to the client

    // Handle document changes from client and broadcast them
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    // Handle saving the document when the client requests to save it
    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
      console.log("Document saved");
    });
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Function to find an existing document or create a new one if it doesn't exist
async function findOrCreateDocument(id) {
  if (!id) return;

  let document = await Document.findById(id);

  if (document) {
    return document; // Document already exists, return it
  }

  // Create a new document if it doesn't exist
  document = await Document.create({ _id: id, data: defaultValue });
  return document;
}

// Start the Express server on port 5000
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
