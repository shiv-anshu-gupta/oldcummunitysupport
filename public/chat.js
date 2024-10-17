document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const chatBox = document.getElementById("chat-box");
  const messageInput = document.getElementById("message");

  const startVoiceBtn = document.getElementById("startVoice");
  const stopVoiceBtn = document.getElementById("stopVoice");

  // Connect to the socket
  const socket = io();

  // Function to append messages to the chat box
  function appendMessage(sender, msg) {
    const messageElement = document.createElement("p");
    messageElement.textContent = `${sender}: ${msg}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
  }

  // Listen for new messages from the server
  socket.on("new message", (data) => {
    appendMessage(data.sender, data.message);
  });

  // Handle form submission for sending chat messages
  chatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return; // Do not send empty messages

    // Send message via socket, including the current user's name
    socket.emit("sendMessage", { sender: currentUserName, message });

    // Clear input field
    messageInput.value = "";
  });

  // Voice recognition setup
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.continuous = true;

  startVoiceBtn.addEventListener("click", () => {
    recognition.start();
    startVoiceBtn.disabled = true;
    stopVoiceBtn.disabled = false;
  });

  stopVoiceBtn.addEventListener("click", () => {
    recognition.stop();
    startVoiceBtn.disabled = false;
    stopVoiceBtn.disabled = true;
  });

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    messageInput.value = transcript;
  };
});
