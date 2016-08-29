import IframeRenderer from "./utils/iframe-renderer";
import DOM from "./utils/h";

const { h1, hr, div, button } = DOM;

function renderer({ counter } = { counter: 1 }, setProps) {
  const inc = () => setProps({ counter: counter + 1 });
  const dec = () => setProps({ counter: counter - 1 });

  return div([
    h1([`<IFrame> counter: ${counter}`]),
    hr([]),
    button({
      onClick: dec,
      class: "btn btn-primary"
    }, [`dec`]),
    " ",
    button({
      onClick: inc,
      class: "btn btn-primary",
    }, [`inc`]),
  ]);
}

IframeRenderer.render(renderer);
