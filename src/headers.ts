export type HeaderValue = string | string[];
export type RawHeaders = string | Record<string, HeaderValue>;

export class HttpHeaders {
  /** lowercase name => values */
  private headers: Map<string, string[]> = new Map<string, string[]>();
  /** Maintain a copy of header name in the form of `lowercase name => normalized name` */
  private normalizedNames: Map<string, string> = new Map();

  constructor(headers?: RawHeaders) {
    if (typeof headers === 'string') {
      headers.split('\n').forEach((line) => {
        if (line.includes(':')) {
          const [name, value] = line.split(/:\s/, 2);
          const key = name.trim().toLowerCase();
          const base = this.headers.get(key) || [];

          base.push(value);

          this.headers.set(key, base);
          this.setNormalizedName(key, name);
        }
      });
    } else if (headers) {
      Object.keys(headers).forEach((name) => {
        const key = name.trim().toLowerCase();
        const value = headers[name];

        this.headers.set(key, Array.isArray(value) ? value : [value]);
        this.setNormalizedName(key, name);
      });
    }
  }

  static from(headers: RawHeaders | HttpHeaders) {
    return headers instanceof HttpHeaders ? headers : new HttpHeaders(headers);
  }

  /**
   * 请求头名称集合
   */
  keys(): string[] {
    return Array.from(this.normalizedNames.values());
  }

  /**
   * 设置请求头的值
   * @param name 请求名称
   * @param value 请求头值
   * @param append 是否追加
   */
  set(name: string, value: HeaderValue, append: boolean = false): HttpHeaders {
    // const clone = this.clone();
    const lowerCaseHeaderName = name.trim().toLowerCase();
    let base: string[] = Array.isArray(value) ? value : [value];
    if (append) {
      base = this.headers.get(lowerCaseHeaderName) || [];
      base.push(...(Array.isArray(value) ? value : [value]));
    }

    this.headers.set(lowerCaseHeaderName, base);
    this.setNormalizedName(lowerCaseHeaderName, name);

    return this;
  }

  /**
   * 向现有值中添加新值
   * @param name
   * @param value
   * @returns
   */
  append(name: string, value: HeaderValue): HttpHeaders {
    return this.set(name, value, true);
  }

  /**
   * 删除请求头
   * @param name 请求头名称
   */
  delete(name: string): HttpHeaders {
    // const clone = this.clone();
    const key = name.trim().toLowerCase();

    this.headers.delete(key);
    this.normalizedNames.delete(key);

    return this;
  }

  /**
   * 获取请求头的所有值
   * @param name 请求头名称
   */
  getAll(name: string): string[] | null {
    return this.headers.get(name.trim().toLowerCase()) || null;
  }

  /**
   * 获取请求头的第一个值
   * @param name 请求头名称
   */
  get(name: string): string | null {
    const all = this.getAll(name);
    return all?.[0] || null;
  }

  /**
   * 是否存在指定请求头
   * @param name 请求头名称
   */
  has(name: string): boolean {
    return this.headers.has(name.trim().toLowerCase());
  }

  forEach(fn: (name: string, value: string[]) => void): void {
    this.headers.forEach((value, name) => fn(this.normalizedNames.get(name)!, value));
  }

  /**
   * 实例销毁
   */
  destroy() {
    this.headers.clear();
    this.normalizedNames.clear();
  }

  /**
   * 克隆对象
   */
  private clone(): HttpHeaders {
    const copy = new HttpHeaders();

    this.headers.forEach((value, name) => {
      copy.headers.set(name, [...value]);
      copy.normalizedNames.set(name, this.normalizedNames.get(name)!);
    });

    return copy;
  }

  /**
   * @param lowercase lowercase name
   * @param normalized normalized name
   */
  private setNormalizedName(lowercase: string, normalized: string) {
    this.normalizedNames.has(lowercase) || this.normalizedNames.set(lowercase, normalized);
  }
}
