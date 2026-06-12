import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

// Suppress THREE.Clock deprecation warning emitted by @react-three/fiber 7 internals.
// Upgrading fiber/drei is major surgery; three 0.184 still ships Clock so warning is purely cosmetic.
const __origWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes("THREE.Clock: This module has been deprecated")) return;
  __origWarn.apply(console, args as []);
};

// require (not import) so the console.warn patch above is installed before
// Loader pulls in fiber/drei. global.d.ts types require() as string (asset
// URLs) — cast for the one module use.
const Loader = (require("./components/Loader") as unknown as { default: React.ComponentType }).default;

async function preloadFonts() {
  const families = ["1em bitlight", "1em jhtitles", '1em "04b25"'];
  const total = families.length;
  window.__nfProgress?.("fonts", 0, total);
  if (!document.fonts || !document.fonts.load) {
    window.__nfProgress?.("fonts", total, total);
    return;
  }
  let loaded = 0;
  await Promise.all(
    families.map((f) =>
      document.fonts
        .load(f)
        .catch(() => {})
        .finally(() => {
          loaded++;
          window.__nfProgress?.("fonts", loaded, total);
        })
    )
  );
}

preloadFonts().then(() => {
  ReactDOM.render(
    <React.StrictMode>
      <Loader />
    </React.StrictMode>,
    document.getElementById("root")
  );
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();