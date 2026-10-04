/** Build-time flag: is the company register public? Safe to import anywhere. */
export function registerIsPublic(): boolean {
  return process.env.REGISTER_LIVE === "true";
}
