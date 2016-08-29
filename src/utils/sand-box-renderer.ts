import * as _ from "lodash";
import { v4 as uuidV4 } from "node-uuid";
import onReady from "./on-ready";
import loadIframe from "./load-iframe";
import { ACTION_ACTION, ACTION_INIT, ACTION_DOM } from "./actions";
import { IVDOMDescriptor } from "./h";
import { IMessageData } from "../interfaces";
import { diff, patch, create, h, VNode, VText } from "virtual-dom";

export default class SandBoxRenderer {
  static POST_MESSAGE_ORIGIN = "*";

  errors: Error[] = [];
  private token = uuidV4();
  private container: Element;
  private iframe: HTMLIFrameElement;

  constructor(iframeSrc: string, container: string | Element) {
    if (_.isString(container)) {
      this.container = document.querySelector(container as string) as Element;
    } else {
      this.container = container as Element;
    }

    addEventListener("message", this.handleMessage, false);

    loadIframe(iframeSrc)
      .then(this.handleIframeLoad, (error) => this.errors.push(error));
  }

  destroy() {
    removeEventListener("message", this.handleMessage, false);
    removeEventListener("click", this.handleContainerClick, false);
  }

  private handleIframeLoad = (event) => {
    const target = event.target as HTMLIFrameElement;
    this.iframe = target;

    requestAnimationFrame(() => {
      const iframe = target as HTMLIFrameElement;
      const data: IMessageData = {
        action: ACTION_INIT,
        token: this.token,
      };

      iframe.contentWindow.postMessage(JSON.stringify(data), SandBoxRenderer.POST_MESSAGE_ORIGIN);
    });
  }

  private handleMessage = (event: MessageEvent) => {
    const data: IMessageData = JSON.parse(event.data || "{}");

    if (data.token !== this.token) {
      return;
    }

    switch (data.action) {
      case ACTION_DOM:
        this.render(data.payload);
    }
  }

  private convertToVDOM = (desc: IVDOMDescriptor | string): VNode | VText | string => {
    if (typeof desc === "string") {
      return desc;
    }

    const { props, tagName, children } = desc;

    if (typeof props === "object") {
      return h(
        tagName,
        this.sanitaizeAttributes(tagName, props),
        children.map(this.convertToVDOM)
      );
    }

    return h(tagName, children.map(this.convertToVDOM));
  }

  private sanitaizeAttributes(tagName: string, props: any) {
    const attributes: any = {
      type: undefined,
      class: props.class,
      "data-elm-id": props["data-elm-id"],
    };

    if (tagName === "button") {
      attributes.type = "button";
    }

    return { attributes };
  }

  private handleContainerClick = (event) => {
    const elmId: string = event.target.dataset.elmId

    const data: IMessageData = {
      action: ACTION_ACTION,
      payload: {
        event: "click",
        elmId,
      },
    };

    this.iframe.contentWindow.postMessage(JSON.stringify(data), SandBoxRenderer.POST_MESSAGE_ORIGIN);
  };

  private render(desc: IVDOMDescriptor) {
    requestAnimationFrame(() => {
      const vdom = this.convertToVDOM(desc) as VNode;
      const node = create(vdom);

      this.container.removeEventListener("click", this.handleContainerClick, false);
      this.container.parentElement.replaceChild(node, this.container);
      this.container = node;
      this.container.addEventListener("click", this.handleContainerClick, false);
    });
  }

  static render(iframeSrc: string, container: string | Element) {
    onReady(() => {
      new SandBoxRenderer(iframeSrc, container);
    });
  }
}
