const express = require("express");
const router = express.Router();
const User = require("../models/User");
const MedicalSupport = require("../models/MedicalSupport");
const Event = require("../models/Event");
const UserSelection = require("../models/MedicalSupportRequest"); // Import the UserSelection model
const { isUserAuthenticated } = require("../middleware/authMiddleware");
const Chat = require("../models/Chat");

// User Dashboard Route
router.get("/dashboard", isUserAuthenticated, (req, res) => {
  console.log("Session User in /dashboard: ", req.session.user);
  try {
    res.render("user-dashboard", { user: req.session.user.name });
    console.log(
      "Rendering user-dashboard.ejs with user: ",
      req.session.user.name
    );
  } catch (err) {
    console.error("Error rendering dashboard: ", err);
    res.status(500).send("An error occurred while rendering the dashboard.");
  }
});

// User Access POST Route (Login)
router.post("/access", async (req, res) => {
  try {
    const { uniqueCode } = req.body;

    if (!uniqueCode) {
      return res
        .status(400)
        .json({ success: false, error: "Unique code is required." });
    }

    const user = await User.findOne({ uniqueCode });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "No user found with this unique code.",
      });
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      uniqueCode: user.uniqueCode,
    };
    res.json({ success: true, message: "Login successful." });
  } catch (err) {
    console.error("Error during login process: ", err);
    res.status(500).send("An error occurred during the login process.");
  }
});

// View Medical Support Route
router.get("/view-medical-support", async (req, res) => {
  try {
    const medicalSupports = await MedicalSupport.find();
    res.render("view-medical-support", { medicalSupports });
  } catch (err) {
    console.error("Error fetching medical support data: ", err);
    res.status(500).send("An error occurred while fetching medical support.");
  }
});

// View Events Route
router.get("/view-events", async (req, res) => {
  try {
    const events = await Event.find();
    res.render("view-events", { events });
  } catch (err) {
    console.error("Error fetching events data: ", err);
    res.status(500).send("An error occurred while fetching events.");
  }
});

// POST route to select medical support
router.post("/select-medical-support", async (req, res) => {
  try {
    const { medicalSupportId } = req.body;
    const userId = req.session.user.id;
    const userName = req.session.user.name;

    if (!userId || !userName || !medicalSupportId) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newSelection = new UserSelection({
      userId,
      userName,
      medicalSupportId,
    });
    await newSelection.save();
    res.status(200).json({ success: "Medical support selected successfully." });
  } catch (error) {
    console.error("Error selecting medical support:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Logout Route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout: ", err);
      return res.status(500).send("Could not log out.");
    }
    res.redirect("/user-access");
  });
});

// User chat page
router.get("/chat", async (req, res) => {
  try {
    const messages = await Chat.find().sort({ createdAt: 1 }); // Fetch messages from the database

    const currentUser = req.session.user || req.session.ngo; // Check if User or NGO is logged in
    if (!currentUser) {
      return res.redirect("/user/login"); // Redirect if no user is logged in
    }

    res.render("chat", { messages, user: currentUser }); // Pass messages and user data to the view
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).send("Server error");
  }
});

// API to fetch chat messages for users
router.get("/chat/messages", isUserAuthenticated, async (req, res) => {
  try {
    const messages = await Chat.find().sort({ createdAt: 1 }); // Get all messages
    res.json({ success: true, messages });
  } catch (err) {
    res.json({ success: false, error: "Error fetching messages" });
  }
});

// API to send chat message for users
router.post("/chat/send", isUserAuthenticated, async (req, res) => {
  try {
    const newMessage = new Chat({
      userId: req.session.user.id,
      message: req.body.message,
    });

    await newMessage.save();
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: "Error sending message" });
  }
});

module.exports = router;
