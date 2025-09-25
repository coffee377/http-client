import { createApp } from "vue";
import APP from "./App.vue";
import "./global.css";
import "./config";

const app = createApp(APP);
app.mount("#app");

window.addEventListener("error", (e) => {
  console.error(">>>> error", e);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error(">>>> unhandledrejection", e);
});
