import { BodyData, RequestOptions } from "@/config";
import { SyncWaterfallHook } from "tapable";

class OptsHook extends SyncWaterfallHook<[RequestOptions]> {
  constructor(name?: string) {
    super(["RequestOptions"] as any, name);

    this.tap({ name: "serialize-data", stage: 10000 }, (opts) => {
      const { data } = opts;
      const serializeData = OptsHook.serializeData(data);
      if (serializeData) {
        opts.data = serializeData;
      }
      return opts;
    });
  }

  /**
   * Transform the free-form body into a serialized format suitable for transmission to the server.
   */
  private static serializeData(data: BodyData): ArrayBuffer | Blob | FormData | URLSearchParams | string | null {
    return null;
  }
}

export default OptsHook;
