import { useEffect, useState } from "react";

export type LayoutMode = "phone" | "tablet" | "desktop";

const getPointerCoarse = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(pointer: coarse)").matches;
};

const getViewportWidth = () => {
  if (typeof window === "undefined") return 1200;
  return window.innerWidth || 1200;
};

export const useResponsiveLayout = () => {
  const [width, setWidth] = useState(getViewportWidth());
  const [isTouch, setIsTouch] = useState(getPointerCoarse());

  useEffect(() => {
    const handleResize = () => setWidth(getViewportWidth());
    const pointerQuery = typeof window.matchMedia === "function" ? window.matchMedia("(pointer: coarse)") : null;
    const handlePointerChange = () => setIsTouch(pointerQuery ? pointerQuery.matches : false);

    window.addEventListener("resize", handleResize);
    if (pointerQuery) {
      pointerQuery.addEventListener("change", handlePointerChange);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (pointerQuery) {
        pointerQuery.removeEventListener("change", handlePointerChange);
      }
    };
  }, []);

  let layout: LayoutMode = "desktop";
  if (width <= 768 || (isTouch && width <= 900)) {
    layout = "phone";
  } else if (width <= 1200 || isTouch) {
    layout = "tablet";
  }

  return { layout, isTouch, width };
};
