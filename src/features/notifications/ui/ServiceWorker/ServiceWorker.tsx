"use client";

import { useEffect } from "react";

// Installs the service worker that shows the offline page
const ServiceWorker = () => {
  // Registers in production only and after the load, so the page never waits
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    // Registers the worker; a browser that refuses it simply has no offline page
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
};

export default ServiceWorker;
