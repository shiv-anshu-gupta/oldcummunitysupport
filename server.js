const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const ngoRoutes = require("./routes/ngo");
const userRoutes = require("./routes/user");
const session = require("express-session");
const Chat = require("./models/Chat");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session Management
app.use(
  session({
    secret: "ngo123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Ensure secure is false for non-HTTPS environments
  })
);

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/ngo", ngoRoutes); // Handles NGO-related routes
app.use("/user", userRoutes); // Handles User-related routes

// Render the index page
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/user-access", (req, res) => {
  res.render("user-access"); // Make sure user-access.ejs exists in the views folder
});

app.get("/login", (req, res) => {
  res.render("login"); // Ensure the login.ejs file exists in the views folder
});

app.get("/medical-support", (req, res) => {
  res.render("medical-support");
});

app.get("/chat", async (req, res) => {
  try {
    const messages = await Chat.find().sort({ createdAt: 1 });
    // Pass user info (from session) to EJS for rendering
    res.render("chat", { user: req.session.user, messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).send("Error loading chat page.");
  }
});

io.on("connection", (socket) => {
  console.log("New user connected");

  // Handle receiving new chat messages
  socket.on("sendMessage", async (data) => {
    const newMessage = new Chat({
      sender: data.sender, // Assuming you send the sender's name with the message
      message: data.message,
    });

    try {
      await newMessage.save(); // Save message to MongoDB

      // Emit the new message to all connected clients
      io.emit("new message", {
        sender: newMessage.sender,
        message: newMessage.message,
      });
    } catch (error) {
      console.error("Error saving message: ", error);
    }
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// MongoDB connection
const PORT = process.env.PORT || 3001;
const mongoURI = "mongodb://localhost:27017/seniorCitizen";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Database connection error: ", err);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // This will log the detailed error on the server
  res.status(500).send("An unexpected error occurred. Please try again later.");
});
