import { default as HeaderHook } from "./HeaderHook";
import { default as OptsHook } from "./OptsHook";
import { default as UriHook } from "./UriHook";

export interface RequestHooks {
  opts: OptsHook;
  header: HeaderHook;
  url: UriHook;
}

export { OptsHook, HeaderHook, UriHook };
