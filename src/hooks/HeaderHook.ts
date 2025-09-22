import { AsArray, SyncWaterfallHook } from "tapable";
import { isBlob, isFormData } from "@/hooks/utils";
import { isArrayBuffer, merge } from "lodash-es";
import { RequestOptions } from "@/config";
import { HttpParams } from "@/http";
import { SafeAny } from "@/types";

class HeaderHook extends SyncWaterfallHook<[Record<string, string>, RequestOptions]> {
  constructor(name: string = "HeaderHook") {
    super(["headers", "options"] as AsArray<any>, name);

    /**
     * 自动侦测 Content-Type
     */
    this.tap({ name: "detect-content-type", stage: -10000 }, (rawHeaders, opts) => {
      const { headers, data } = opts;
      const contentType = HeaderHook.detectContentTypeHeader(data);
      // if (!headers.has("Accept")) {
      //   headers["Accept"] = "application/json, text/plain, */*";
      // }
      return merge({}, rawHeaders, contentType ? { "Content-Type": contentType } : {}, headers);
    });
  }

  private static detectContentTypeHeader(body: SafeAny): string | null {
    if (body === null) {
      return null;
    }
    // FormData 主体依赖于浏览器的内容类型分配。
    if (isFormData(body)) {
      return null;
    }
    // Blob 通常有自己的内容类型。如果不是，则无法推断任何类型。
    if (isBlob(body)) {
      return body.type || null;
    }
    // 数组缓冲区的内容未知，因此无法推断类型。
    if (isArrayBuffer(body)) {
      return null;
    }
    // 从技术上讲，字符串可以是 JSON 数据的一种形式，但假设它们是纯字符串就足够安全了。
    if (typeof body === "string") {
      return "text/plain";
    }
    // `HttpUrlEncodedParams` 有自己的内容类型。
    if (body instanceof HttpParams) {
      return "application/x-www-form-urlencoded;charset=UTF-8";
    }
    // 数组、对象、布尔值和数字将被编码为 JSON。
    if (["object", "number", "boolean"].includes(typeof body)) {
      return "application/json";
    }

    return null;
  }
}

export default HeaderHook;
