export default function loadIframe(src: string): Promise<Event> {
  return new Promise(function(resolve, reject) {
    const iframe: HTMLIFrameElement = document.createElement("iframe");

    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.hidden = true;
    iframe.src = src;
    iframe.onload = resolve;
    iframe.onerror = reject;

    document.body.appendChild(iframe);
  });
}
