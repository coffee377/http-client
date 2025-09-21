import { replacePlaceholderParameters, urlPathJoin } from "@/utils";
import { AsArray, SyncWaterfallHook } from "tapable";
import { UriOptions } from "@/config";
import { UriPlugin } from "./const";

class UriHook extends SyncWaterfallHook<[string, UriOptions]> {
  constructor(name: string = "UriHook") {
    super(["url", "options"] as AsArray<any>, name);

    /* 去除前端约定的默认 “/api” 前缀 */
    this.tap({ name: "api", stage: UriPlugin.TRIM_API }, (url = "", opts) => {
      return url.replace(/^\/api\/?(.*)/, "/$1");
    });

    /* 微服务前缀 */
    this.tap({ name: "micro", stage: UriPlugin.MICRO }, (url, opts) => {
      const { services, alias } = opts;
      let microPrefix: string = "";

      const arr: string[] = [];
      /* 微服务前缀获取 */
      if (services && alias) microPrefix = services[alias];
      if (microPrefix) arr.push(microPrefix);

      arr.push(url);
      return urlPathJoin(arr);
    });

    /* prefix 前缀 */
    this.tap({ name: "prefix", stage: UriPlugin.PREFIX }, (url, opts) => {
      const { prefix = "", env = "default" } = opts;
      let envPrefix: Record<string, string> = {};

      /* 局部配置 */
      if (typeof prefix == "string") {
        envPrefix["default"] = prefix;
      } else if (typeof prefix == "object") {
        envPrefix = prefix;
      }

      let pre: string = "";

      if (Reflect.has(envPrefix, env)) pre = envPrefix[env];

      return urlPathJoin([pre, url]);
    });

    /* 占位参数替换 */
    this.tap({ name: "paths", stage: UriPlugin.PATHS }, (url, { paths }) => {
      return replacePlaceholderParameters(url, paths);
    });

    /* params 参数处理 */
    this.tap({ name: "params", stage: UriPlugin.PARAMS }, (url, opts) => {
      const params = new URLSearchParams(opts.params);
      if (params.size == 0) return url;
      // 这里需要处理三种情况：
      // 1. url 中没有 ?，则需要添加 ?
      // 2. url 中有 ?，则需要添加 &
      // 3. url 末尾是 ?，则什么都不需要添加
      const index = url.indexOf("?");
      const sep = index === -1 ? "?" : index < url.length - 1 ? "&" : "";
      return url + sep + params.toString();
    });
  }
}

export default UriHook;
