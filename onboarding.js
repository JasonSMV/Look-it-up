const PermissionGrantedText = document.querySelector(
  "[data-permision-granted-text]"
);
const permissionsContainter = document.querySelector(
  "[data-permission-container]"
);

const permissionsBtn = document.querySelector("[data-permission-btn]");

permissionsBtn.addEventListener("click", (e) => {
  // Permissions must be requested from inside a user gesture, like a button's
  // click handler.
  chrome.permissions.request(
    {
      origins: ["<all_urls>"],
    },
    (granted) => {
      // The callback argument will be true if the user granted the permissions.
      if (granted) {
        PermissionGrantedText.textContent = "GRANTED";
        setTimeout(function () {
          permissionsContainter.classList.add("visually-hidden");
        }, 750);
      }
    }
  );
});

// Checks if permission is active.

chrome.permissions.contains(
  {
    origins: ["<all_urls>"],
  },
  (result) => {
    if (result) {
      permissionsContainter.classList.add("visually-hidden");
    }
  }
);
