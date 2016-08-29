import * as _ from "lodash";
import { v4 as uuidV4 } from "node-uuid";

export interface IProps {
  class?: string;
  onClick?: () => any;
}

export interface IVDOMDescriptor {
  tagName: string;
  props: IProps;
  children: Array<IVDOMDescriptor | string>;
}

type Children = Array<IVDOMDescriptor | string>;

function h(tagName: string, props: IProps, children?: Children): IVDOMDescriptor {
  children = children || [];

  return {
    tagName,
    props,
    children,
  };
}

export default new Proxy(h, {
  get(target, tagName: string) {
    return function(props: IProps | Children[], children: Children[] = []) {
      const extProps = {
        "data-elm-id": uuidV4(),
      };

      if (Array.isArray(props)) {
        return target(tagName, extProps, props as Children[]);
      } else {
        return target(tagName, _.assign({}, props, extProps), children);
      }
    };
  }
});
