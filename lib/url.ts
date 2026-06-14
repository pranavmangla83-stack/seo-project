export function normalizeWebsiteUrl(input: string) {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  const url = new URL(withProtocol);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Website URL must start with http or https.");
  }

  if (!url.hostname.includes(".")) {
    throw new Error("Enter a full website URL, like example.com.");
  }

  url.hash = "";
  return url.toString();
}
