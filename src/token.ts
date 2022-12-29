/**
 * 令牌配置
 */
export interface TokenConfiguration<V> {
  access_token: V;
  refresh_token?: V;
  id_token?: V;
}

/**
 * 令牌类型
 * @see https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-05
 */
export type TokenType = keyof TokenConfiguration<any>;

/**
 * 令牌存储类型
 * <p>目前仅支持 localStorage 和 sessionStorage ，后期可继续扩展</p>
 */
export type StorageType = 'local' | 'session';

/**
 * 令牌存储的 key 配置
 */
export type TokenStorageKey = string | TokenConfiguration<string>;

export const TOKEN_STORAGE_KEY: TokenConfiguration<string> = {
  access_token: 'Authorization',
  refresh_token: 'refresh_token',
  id_token: 'id_token',
};

/**
 * 令牌参数名称
 */
export type TokenParamKey = TokenConfiguration<string>;

export const TOKEN_PARAM_KEY: TokenConfiguration<string> = {
  access_token: 'Authorization',
  refresh_token: 'refresh_token',
  id_token: 'id_token',
};

/**
 * 令牌存储类型配置
 */
export type TokenStorage = StorageType | TokenConfiguration<StorageType>;

export const TOKEN_STORAGE: TokenConfiguration<StorageType> = {
  access_token: 'local',
  id_token: 'local',
  refresh_token: 'local',
};

/**
 * 令牌配置
 */
export interface TokenConfiguration<V> {
  access_token: V;
  refresh_token?: V;
  id_token?: V;
}

export interface TokenOptions {
  /**
   * 多令牌支持
   */
  multiSupport?: boolean;

  /**
   * 令牌存储位置
   */
  storage?: TokenStorage;

  /**
   * 令牌存储在 Storage 的 Key 值
   */
  storageKey?: TokenStorageKey;

  /**
   * 访问令牌前缀
   * @deprecated use accessTokenType instead
   */
  prefix?: string;

  /**
   * 是否 bearer token
   * @default false
   * @deprecated use accessTokenType instead
   */
  bearer?: boolean;

  /**
   * 访问令牌类型
   */
  accessTokenType?: 'Bearer' | string;

  /**
   * 令牌请求参数 key
   */
  paramKey?: TokenParamKey;
}

/**
 * 令牌管理器
 */
interface TokenManager {
  readonly storage: StorageType;
  readonly storageKey: string;

  /**
   * 获取令牌
   */
  getToken(storageType: StorageType): string;

  /**
   * 令牌校验
   * @param token
   */
  introspection(token: string): boolean;
}

interface TokenManager2 {
  storage: TokenStorage;
  tokenStorageKey: TokenStorageKey;

  getToken(storageType: StorageType): string;

  getTokenParamKey(type: TokenType): string;
}

// export class DefaultTokenManager implements TokenManager {
//   constructor(opts?: TokenOptions) {}
//
//   storage: TokenStorage;
//   tokenStorageKey: TokenStorageKey;
//
//   getToken(type: StorageType): string {
//     const key = this.tokenStorageKey[type];
//
//     /* 令牌存储类型 */
//     const sto = this.storage == 'session' ? sessionStorage : localStorage;
//
//     /* 获取令牌 */
//     const token = sto.getItem(key)?.replace(/["'](.*)["']/, '$1') || '';
//     return '';
//   }
//
//   getTokenParamKey(type: TokenType): string {
//     return '';
//   }
// }
