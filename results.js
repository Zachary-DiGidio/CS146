// Zachary Wilkinson and Zachary DiGidio

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const username = params.get("user") || "";
  const accountType = params.get("type") || "any";

  // Sanitize: GitHub usernames are alphanumeric + hyphens only
  const safeUsername = username.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 39);

  // DOM refs
  const loadingState = document.getElementById("loading-state");
  const errorState = document.getElementById("error-state");
  const resultsState = document.getElementById("results-state");
  const errorMsg = document.getElementById("error-msg");

  const displayUsername = document.getElementById("display-username");
  const accountBadge = document.getElementById("account-badge");
  const followersEl = document.getElementById("followers-count");
  const followingEl = document.getElementById("following-count");
  const changeEl = document.getElementById("change-count");
  const changeBox = document.getElementById("change-box");
  const changeLabel = document.getElementById("change-label");
  const firstTimeNote = document.getElementById("first-time-note");
  const historyNote = document.getElementById("history-note");
  const displayName = document.getElementById("display-name");
  const publicRepos = document.getElementById("public-repos");

  if (!safeUsername) {
    showError("No username provided.");
    return;
  }

  let data;
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(safeUsername)}`);

    if (response.status === 404) {
      showError(`No GitHub user found for "${safeUsername}".`);
      return;
    }
    if (!response.ok) {
      showError(`GitHub API error: ${response.status}. Try again shortly.`);
      return;
    }

    data = await response.json();
  } catch (err) {
    showError("Network error — check your connection and try again.");
    return;
  }

  if (accountType !== "any") {
    if (data.type && data.type.toLowerCase() !== accountType) {
      showError(`"${safeUsername}" is not a ${accountType} account.`);
      return;
    }
  }

  const currentFollowers = data.followers;
  const currentFollowing = data.following;
  const name = data.name || "";
  const repos = data.public_repos;
  const type = data.type || "User";

  const storageKey = `gitsnitch_${safeUsername.toLowerCase()}`;
  const previousRaw = localStorage.getItem(storageKey);

  let delta = null;
  let isFirstVisit = true;

  if (previousRaw !== null) {
    try {
      const prev = JSON.parse(previousRaw);
      if (typeof prev.followers === "number") {
        delta = currentFollowers - prev.followers;
        isFirstVisit = false;
      }
    } catch (_) {
      // corrupted
    }
  }

  localStorage.setItem(storageKey, JSON.stringify({
    followers: currentFollowers,
    following: currentFollowing,
    checkedAt: new Date().toISOString(),
  }));

  displayUsername.textContent = safeUsername;
  accountBadge.textContent = type;
  followersEl.textContent = currentFollowers.toLocaleString();
  followingEl.textContent = currentFollowing.toLocaleString();

  if (name) {
    displayName.textContent = name;
  }
  if (repos !== undefined) {
    publicRepos.textContent = `${repos.toLocaleString()} public repos`;
  }

  if (isFirstVisit) {
    firstTimeNote.style.display = "block";
    historyNote.style.display = "none";
    changeBox.style.display = "none";
  } else {
    firstTimeNote.style.display = "none";
    historyNote.style.display = "block";
    changeBox.style.display = "flex";

    const sign = delta >= 0 ? "+" : "";
    changeEl.textContent = `${sign}${delta.toLocaleString()}`;
    changeLabel.textContent = delta >= 0 ? "Gained since last check" : "Lost since last check";

    changeEl.classList.remove("green", "red");
    if (delta > 0) changeEl.classList.add("green");
    else if (delta < 0) changeEl.classList.add("red");
  }

  [followersEl, followingEl, changeEl].forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => {
      el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 150 + i * 120);
  });

  loadingState.style.display = "none";
  resultsState.style.display = "block";

  function showError(msg) {
    loadingState.style.display = "none";
    errorState.style.display = "block";
    errorMsg.textContent = msg;
  }
});
