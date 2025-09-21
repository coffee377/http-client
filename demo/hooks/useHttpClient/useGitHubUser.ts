import { QueryResult, useRequest } from "vue-request";
import http from "@@/src";

// TypeScript类型定义 - GitHub用户数据
interface GitHubPlan {
  name: string;
  space: number;
  collaborators: number;
  private_repos: number;
}

interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  hireable?: boolean;
  bio?: string;
  twitter_username?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  private_gists: number;
  total_private_repos: number;
  owned_private_repos: number;
  disk_usage: number;
  collaborators: number;
  two_factor_authentication: boolean;
  plan: GitHubPlan;
}

const getGitHubUserInfo = (username: string) => {
  return http.get<GitHubUser>("/api/users/{username}", {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: "Bearer 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",
    },
    alias: "oneself",
    paths: { username },
  });
};

export function useGitHubUser(username: string = "coffee377"): QueryResult<GitHubUser, [string]> {
  return useRequest<GitHubUser, [string]>(getGitHubUserInfo, {
    defaultParams: [username],
  });
}
