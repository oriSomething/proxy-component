export default function onReady(cb: () => void): void {
  if (document.readyState === "complete") {
    setImmediate(() => cb());
  } else {
    addEventListener("DOMContentLoaded", () => cb(), false);
  }
}
