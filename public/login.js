document.addEventListener("DOMContentLoaded", () => {
  // Handle number button clicks for uniqueCode input
  document.querySelectorAll(".number-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById("uniqueCode");
      input.value += button.getAttribute("data-value");
    });
  });

  // Handle clear button click for uniqueCode input
  const clearButton = document.querySelector(".clear-btn");
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      document.getElementById("uniqueCode").value = "";
    });
  } else {
    console.error("Clear button not found.");
  }

  // Handle form submission for user login
  document
    .getElementById("userLoginForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const uniqueCode = document.getElementById("uniqueCode").value;

      try {
        const response = await fetch("/user/access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uniqueCode }), // Sending uniqueCode to backend
        });

        const result = await response.json();
        if (result.success) {
          window.location.href = "/user/dashboard"; // Redirect to dashboard on success
        } else {
          alert(result.error);
        }
      } catch (error) {
        console.error("An error occurred during login:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    });

  // Handle form submission for NGO login
  // Handle form submission for NGO login
  document
    .getElementById("ngoLoginForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch("/ngo/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json(); // Get the JSON response
        if (result.success) {
          window.location.href = "/ngo/dashboard"; // Redirect to dashboard on success
        } else {
          alert(result.error); // Display error message on failure
        }
      } catch (error) {
        console.error("An error occurred during login:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    });
});
