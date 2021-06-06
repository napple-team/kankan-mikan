function saveOptions(ev) {
  ev.preventDefault();
  browser.storage.sync.set({
    url: document.getElementById("url").value,
    username: document.getElementById("username").value
  });
}

function setCurrentInput(result) {
  document.getElementById("url").value = result.url || "";
  document.getElementById("username").value = result.username || "";
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function restoreOptions() {
  const getting = browser.storage.sync.get(["url", "username"]);
  getting.then(setCurrentInput, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
