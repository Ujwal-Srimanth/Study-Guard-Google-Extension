// popup.js

// When the toggle is changed
document.getElementById("toggle").addEventListener("change", function () {
  const isEnabled = this.checked;
  chrome.storage.local.set({ enabled: isEnabled }, () => {
    console.log("StudyGuard: Mode set to", isEnabled ? "ENABLED" : "DISABLED");
  });
});

// When the popup loads, set toggle to stored state
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("enabled", (data) => {
    const toggle = document.getElementById("toggle");
    toggle.checked = data.enabled || false;
    console.log("StudyGuard: Loaded mode =", toggle.checked ? "ENABLED" : "DISABLED");
  });
});
