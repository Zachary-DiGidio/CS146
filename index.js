// Athanasios Kousis and Matthew Stein

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("snitch-form");
  const usernameInput = document.getElementById("username");
  const rememberCheckbox = document.getElementById("remember-me");
  const statusMsg = document.getElementById("status-msg");

  const savedUser = localStorage.getItem("lastUsername");
  const savedRemember = localStorage.getItem("rememberMe") === "true";
  if (savedRemember && savedUser) {
    usernameInput.value = savedUser;
    rememberCheckbox.checked = true;
  }

  usernameInput.addEventListener("input", () => {
    const val = usernameInput.value.trim();
    const valid = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(val) || val.length === 1 && /^[a-zA-Z0-9]$/.test(val);

    if (val.length === 0) {
      statusMsg.textContent = "";
      usernameInput.classList.remove("input-ok", "input-err");
    } else if (!valid) {
      statusMsg.textContent = "⚠ Only letters, numbers, and hyphens. No leading/trailing hyphens.";
      usernameInput.classList.add("input-err");
      usernameInput.classList.remove("input-ok");
    } else {
      statusMsg.textContent = "✓ Looks good!";
      usernameInput.classList.add("input-ok");
      usernameInput.classList.remove("input-err");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const accountType = document.getElementById("account-type").value;

    if (!username) {
      statusMsg.textContent = "⚠ Please enter a username.";
      usernameInput.focus();
      return;
    }

    if (rememberCheckbox.checked) {
      localStorage.setItem("lastUsername", username);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("lastUsername");
      localStorage.setItem("rememberMe", "false");
    }

    const params = new URLSearchParams({ user: username, type: accountType });
    window.location.href = `results.html?${params.toString()}`;
  });
});
