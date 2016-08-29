import "setimmediate";
import * as _ from "lodash";
import { ACTION_ACTION, ACTION_INIT, ACTION_DOM } from "./actions";
import { IVDOMDescriptor } from "./h";
import { IMessageData } from "../interfaces";
import mergeMaps from "./merge-maps";

export type PropsSetter = (props: Object) => void;
export type Renderer = (props: any, setProps: PropsSetter) => IVDOMDescriptor;

type Actions = Map<string, () => any>;

export default class IframeRenderer {
  // IFrame related
  private source: Window;
  // IFrame related
  private origin: string;
  // IFrame related
  private token: string;
  private props: Object | undefined;
  private actions: Actions = new Map<string, () => any>();

  constructor(private renderer: Renderer) {
    addEventListener("message", this.handleMountMessage, false);
  }

  private handleMountMessage = ({ source, origin }: MessageEvent) => {
    removeEventListener("message", this.handleMountMessage, false);

    this.source = source;
    this.origin = origin;
    addEventListener("message", this.handleMessage, false);
  }

  private handleMessage = (event: MessageEvent) => {
    const data: IMessageData = JSON.parse(event.data || "{}");

    switch (data.action) {
      case ACTION_INIT:
        this.token = data.token!;
        this.origin = event.origin;
        this.source = event.source;
        this.render();
        break;

      case ACTION_ACTION:
        if (this.actions.has(data.payload.elmId)) {
          const action = this.actions.get(data.payload.elmId);
          setImmediate(() => {
            try {
              action!();
            } finally {}
          });
        }
        break;
    }
  }

  private setProps = (props: Object) => {
    this.props = Object.freeze(_.assign({}, this.props, props));
    setImmediate(() => this.render());
  }

  private postRenderMessage(domDescriptor: IVDOMDescriptor) {
    const data: IMessageData = {
      action: ACTION_DOM,
      payload: domDescriptor,
      token: this.token,
    };

    this.actions.clear();
    mergeMaps(this.actions, this.getActions(domDescriptor));

    this.source.postMessage(JSON.stringify(data), this.origin);
  }

  private getActions(desc: IVDOMDescriptor) {
    const actions: Actions = new Map();
    const { children, props } = desc;

    if (children) {
      for (let child of children) {
        if (_.isString(child)) continue;
        mergeMaps(actions, this.getActions(child));
      }
    }

    if (props && typeof props.onClick === "function") {
      actions.set(props["data-elm-id"], props.onClick);
    }

    return actions;
  }

  private render() {
    const props = this.props;
    const domDescriptor = this.renderer(props, this.setProps);

    this.postRenderMessage(domDescriptor);
  }

  static render(renderer: Renderer): void {
    new IframeRenderer(renderer);
  }
}
