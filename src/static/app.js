document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Reset activity select options (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build markup for the main card content
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Create participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants";

        const participantsHeader = document.createElement("h5");
        participantsHeader.textContent = "Participants";
        participantsSection.appendChild(participantsHeader);

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";

        if (details.participants && details.participants.length > 0) {
          details.participants.forEach((pEmail) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            const badge = document.createElement("span");
            badge.className = "participant-badge";
            // Show initials derived from email local part, fallback to full email
            const localPart = pEmail.split("@")[0] || pEmail;
            const initials = localPart.split(/[\.\-_]/).map(s => s[0]).join("").slice(0,2).toUpperCase();
            badge.textContent = initials;

            const emailSpan = document.createElement("span");
            emailSpan.className = "participant-email";
            emailSpan.textContent = " " + pEmail;

            // Add delete icon
            const deleteIcon = document.createElement("span");
            deleteIcon.className = "delete-icon";
            deleteIcon.title = "Unregister participant";
            deleteIcon.innerHTML = "&#128465;"; // Unicode trash can
            deleteIcon.style.cursor = "pointer";
            deleteIcon.style.marginLeft = "8px";
            deleteIcon.addEventListener("click", async (e) => {
              e.stopPropagation();
              // Call unregister API
              try {
                const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(pEmail)}`, {
                  method: "POST"
                });
                const result = await response.json();
                if (response.ok) {
                  messageDiv.textContent = result.message || "Participant unregistered.";
                  messageDiv.className = "message success";
                  fetchActivities();
                } else {
                  messageDiv.textContent = result.detail || "Failed to unregister participant.";
                  messageDiv.className = "message error";
                }
                messageDiv.classList.remove("hidden");
                setTimeout(() => { messageDiv.classList.add("hidden"); }, 5000);
              } catch (error) {
                messageDiv.textContent = "Error unregistering participant.";
                messageDiv.className = "message error";
                messageDiv.classList.remove("hidden");
                setTimeout(() => { messageDiv.classList.add("hidden"); }, 5000);
              }
            });

            li.appendChild(badge);
            li.appendChild(emailSpan);
            li.appendChild(deleteIcon);
            participantsList.appendChild(li);
          });
        } else {
          const emptyLi = document.createElement("li");
          emptyLi.className = "participant-empty";
          emptyLi.textContent = "No participants yet";
          participantsList.appendChild(emptyLi);
        }

        participantsSection.appendChild(participantsList);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        // use base message class plus modifier
        messageDiv.className = "message success";
        signupForm.reset();
        // Refresh activities so participants list updates immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
