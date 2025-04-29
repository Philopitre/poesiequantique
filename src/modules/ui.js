// modules/ui.js
export function showNotification(message) {
  const bar = document.getElementById("notificationBar");
  if (!bar) return;
  bar.innerText = message;
  bar.style.display = "block";
  bar.classList.remove("fade-out");
  setTimeout(() => {
    bar.classList.add("fade-out");
    setTimeout(() => {
      bar.style.display = "none";
      bar.classList.remove("fade-out");
    }, 500);
  }, 3000);
}

export function showError(error) {
  console.error(error);
  showNotification("Erreur : " + error);
}
