export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export interface GitHubFile<T> {
  path: string;
  sha: string;
  data: T;
}

interface ContentsResponse {
  content: string;
  sha: string;
  encoding: "base64";
}

const apiBase = "https://api.github.com";

export async function readJsonFile<T>(config: GitHubConfig, path: string): Promise<GitHubFile<T>> {
  const response = await fetch(fileUrl(config, path), {
    headers: githubHeaders(config.token),
  });

  if (!response.ok) {
    throw new Error(`GitHub read failed for ${path}: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as ContentsResponse;
  const decoded = JSON.parse(decodeBase64(payload.content)) as T;
  return { path, sha: payload.sha, data: decoded };
}

export async function writeJsonFile<T>(config: GitHubConfig, path: string, data: T, sha: string, message: string) {
  const response = await fetch(fileUrl(config, path), {
    method: "PUT",
    headers: githubHeaders(config.token),
    body: JSON.stringify({
      message,
      content: encodeBase64(JSON.stringify(data, null, 2)),
      sha,
      branch: config.branch,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub write failed for ${path}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function ensureShaUnchanged(config: GitHubConfig, path: string, loadedSha: string) {
  const response = await fetch(fileUrl(config, path), {
    headers: githubHeaders(config.token),
  });

  if (!response.ok) {
    throw new Error(`Could not verify latest SHA for ${path}.`);
  }

  const payload = (await response.json()) as ContentsResponse;
  if (payload.sha !== loadedSha) {
    throw new Error("Data changed from another device. Reload latest data before saving.");
  }

  return payload.sha;
}

export async function saveWithConflictCheck<T>(
  config: GitHubConfig,
  file: GitHubFile<T>,
  nextData: T,
  message: string,
) {
  await ensureShaUnchanged(config, file.path, file.sha);
  return writeJsonFile(config, file.path, nextData, file.sha, message);
}

export function persistLocalConfig(config: Omit<GitHubConfig, "token"> & { rememberToken: boolean; token?: string }) {
  localStorage.setItem("kt_github_config", JSON.stringify(config));
}

export function loadLocalConfig() {
  const raw = localStorage.getItem("kt_github_config");
  if (!raw) return null;
  return JSON.parse(raw) as Omit<GitHubConfig, "token"> & { rememberToken: boolean; token?: string };
}

function fileUrl(config: GitHubConfig, path: string) {
  return `${apiBase}/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`;
}

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function decodeBase64(value: string) {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(value.replace(/\n/g, "")), (character: string) => `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(""),
  );
}

function encodeBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}
