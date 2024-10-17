const express = require("express");
const router = express.Router();
const Ngo = require("../models/Ngo");
const MedicalSupport = require("../models/MedicalSupport");
const User = require("../models/User");
const Event = require("../models/Event");
const { isNgoAuthenticated } = require("../middleware/authMiddleware");
const Chat = require("../models/Chat");

// NGO Registration Page Route
router.get("/register", (req, res) => {
  res.render("ngo-register");
});

// NGO Registration POST Route
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingNgo = await Ngo.findOne({ email });

    if (existingNgo) {
      return res
        .status(400)
        .json({ error: "NGO with this email already exists." });
    }

    const newNgo = new Ngo({ name, email, password }); // Hash the password in production
    await newNgo.save();
    return res.redirect("/ngo/login");
  } catch (err) {
    console.error("Error during NGO registration:", err);
    return res.status(500).send("Server error");
  }
});

// NGO Login POST Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const ngo = await Ngo.findOne({ email });

    if (!ngo || ngo.password !== password) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid email or password" });
    }

    req.session.ngo = { id: ngo._id, name: ngo.name };
    delete req.session.user; // Clear any existing user session

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error during NGO login:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// NGO Dashboard Route
router.get("/dashboard", isNgoAuthenticated, async (req, res) => {
  try {
    const medicalSupports = await MedicalSupport.find({});
    const events = await Event.find({});
    const ngoName = req.session.ngo.name;

    res.render("ngo-Dashboard", { ngoName, medicalSupports, events });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Route to render the medical support page
router.get("/medical-support", isNgoAuthenticated, async (req, res) => {
  try {
    const medicalSupports = await MedicalSupport.find({});
    const ngoName = req.session.ngo.name;

    res.render("medical-support", { medicalSupports, ngoName });
  } catch (err) {
    console.error("Error fetching medical supports:", err);
    res.status(500).send("Server Error");
  }
});

// Route to render the NGO login page
router.get("/login", (req, res) => {
  res.render("login"); // Ensure that "login.ejs" exists in your views folder
});

// NGO Logout Route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Unable to log out");
    }
    return res.redirect("/ngo/login"); // Redirect to login page after logout
  });
});

// Route for creating medical support
router.post("/create-medical-support", isNgoAuthenticated, async (req, res) => {
  try {
    const { title, description, type } = req.body;

    if (!title || !description || !type) {
      return res.status(400).send("All fields are required.");
    }

    const ngoName = req.session.ngo.name;

    const newSupport = new MedicalSupport({
      title,
      description,
      type,
      ngoName,
    });
    await newSupport.save();
    res.redirect("/ngo/medical-support");
  } catch (error) {
    console.error("Error creating medical support:", error);
    res.status(500).send("Internal server error.");
  }
});

// Route for creating events
router.post("/create-event", isNgoAuthenticated, async (req, res) => {
  try {
    const { title, description, location, time, organizer, date } = req.body;

    if (!title || !description || !location || !time || !organizer || !date) {
      return res.status(400).send("All fields are required.");
    }

    const newEvent = new Event({
      title,
      description,
      location,
      time,
      date,
      organizer,
    });
    await newEvent.save();
    res.redirect("/ngo/events");
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).send("Internal server error.");
  }
});

// Route to view events
router.get("/events", isNgoAuthenticated, async (req, res) => {
  try {
    const events = await Event.find();
    const ngoName = req.session.ngo.name; // Fetch NGO name from session
    res.render("events", { events, ngoName }); // Pass ngoName to the view
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).send("Internal server error.");
  }
});

// NGO Chat Page
router.get("/chat", async (req, res) => {
  try {
    const messages = await Chat.find().sort({ createdAt: 1 }); // Fetch messages from the database

    const currentUser = req.session.ngo || req.session.user; // Check if NGO or User is logged in
    if (!currentUser) {
      return res.redirect("/ngo/login"); // Redirect if no user is logged in
    }

    res.render("chat", { messages, user: currentUser }); // Pass messages and user data to the view
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).send("Server error");
  }
});

// API to fetch chat messages for NGOs
router.get("/chat/messages", isNgoAuthenticated, async (req, res) => {
  try {
    const messages = await Chat.find().sort({ createdAt: 1 }); // Get all messages
    res.json({ success: true, messages });
  } catch (err) {
    res.json({ success: false, error: "Error fetching messages" });
  }
});

// API to send chat message for NGOs
router.post("/chat/send", isNgoAuthenticated, async (req, res) => {
  try {
    const newMessage = new Chat({
      sender: req.session.ngo.name, // NGO name as sender
      message: req.body.message,
    });

    await newMessage.save();
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: "Error sending message" });
  }
});
// POST route for creating a user
router.post("/create-user", isNgoAuthenticated, async (req, res) => {
  const { name, phoneNumber, adharcard, city, uniqueCode } = req.body;

  try {
    const existingUser = await User.findOne({ phoneNumber });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this phone number already exists." });
    }

    const newUser = new User({
      name,
      phoneNumber,
      adharcard,
      city,
      uniqueCode,
    });

    await newUser.save();
    res.redirect("/ngo/dashboard"); // Redirect to NGO dashboard after user creation
  } catch (err) {
    console.error("Error during user creation:", err);
    return res.status(500).send("Server error");
  }
});

// Route for rendering the user creation page
router.get("/create-user", isNgoAuthenticated, (req, res) => {
  res.render("createUser"); // Ensure the "createUser.ejs" file is correctly placed in the views folder
});

// Route to handle the update of medical support
router.post(
  "/edit-medical-support/:id",
  isNgoAuthenticated,
  async (req, res) => {
    try {
      const medicalSupportId = req.params.id;
      const { title, description, type } = req.body;

      // Find the medical support entry by ID and update it
      const updatedSupport = await MedicalSupport.findByIdAndUpdate(
        medicalSupportId,
        { title, description, type },
        { new: true } // Return the updated document
      );

      if (!updatedSupport) {
        return res.status(404).send("Medical Support not found");
      }

      res.redirect("/ngo/medical-support"); // Redirect back to the medical support list
    } catch (error) {
      console.error("Error updating medical support:", error);
      res.status(500).send("Server error");
    }
  }
);

// Route to render the edit medical support page
router.get(
  "/edit-medical-support/:id",
  isNgoAuthenticated,
  async (req, res) => {
    try {
      const medicalSupportId = req.params.id;
      const medicalSupport = await MedicalSupport.findById(medicalSupportId);

      if (!medicalSupport) {
        return res.status(404).send("Medical Support not found");
      }

      const ngoName = req.session.ngo.name; // Get the NGO name from the session

      res.render("edit-medical-support", { medicalSupport, ngoName }); // Render the edit form
    } catch (error) {
      console.error("Error fetching medical support for editing:", error);
      res.status(500).send("Server error");
    }
  }
);

// Route to render the edit event page
router.get("/edit-event/:id", isNgoAuthenticated, async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).send("Event not found");
    }

    const ngoName = req.session.ngo.name; // Get the NGO name from the session

    res.render("edit-event", { event, ngoName }); // Render the edit form
  } catch (error) {
    console.error("Error fetching event for editing:", error);
    res.status(500).send("Server error");
  }
});

// Route to handle the update of an event
router.post("/edit-event/:id", isNgoAuthenticated, async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, location, time, organizer, date } = req.body;

    // Find the event by ID and update it
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { title, description, location, time, organizer, date },
      { new: true } // Return the updated document
    );

    if (!updatedEvent) {
      return res.status(404).send("Event not found");
    }

    res.redirect("/ngo/events"); // Redirect back to the events list
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).send("Server error");
  }
});

// Route to delete medical support
router.delete(
  "/delete-medical-support/:id",
  isNgoAuthenticated,
  async (req, res) => {
    try {
      const medicalSupportId = req.params.id;
      const deletedSupport = await MedicalSupport.findByIdAndDelete(
        medicalSupportId
      );

      if (!deletedSupport) {
        return res.status(404).send("Medical Support not found");
      }

      res.status(200).send("Medical Support deleted successfully");
    } catch (error) {
      console.error("Error deleting medical support:", error);
      res.status(500).send("Server error");
    }
  }
);

router.delete("/ngo/delete-event/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`Attempting to delete event with id: ${id}`); // Debugging line
  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error); // Enhanced logging
    res.status(500).json({ message: "Error deleting event" });
  }
});

module.exports = router;
