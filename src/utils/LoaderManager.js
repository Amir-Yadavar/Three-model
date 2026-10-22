import * as THREE from "three";

export const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
  console.log(`start loading : ${url} . (${itemsLoaded} / ${itemsTotal})`);
};
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const progressPercent = Math.round((itemsLoaded / itemsTotal) * 100);
 console.log(
    `📦 فایل لود شد: ${url} | پیشرفت کل: ${itemsLoaded} از ${itemsTotal} (${progressPercent}%)`
  );
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }
};
loadingManager.onLoad = () => {
  console.log("all file loaded .");
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.add("fade-out");
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }
};
loadingManager.onError = (url) => {
  console.log(` error in loading in : ${url}`);
};
