export const ALLOWED_ADMIN_GITHUB_USERNAME = "spatil029";

export function normalizeGithubUsername(value: string | undefined | null) {
  return value?.trim() ?? "";
}

export function isValidGithubUsername(value: string | undefined | null) {
  const username = normalizeGithubUsername(value);

  if (!username) {
    return false;
  }

  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(username);
}

export function isAdminGithubUser(value: string | undefined | null) {
  return normalizeGithubUsername(value) === ALLOWED_ADMIN_GITHUB_USERNAME;
}
