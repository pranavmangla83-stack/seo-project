export function normalizeWebsiteUrl(input: string) {
  const trimmed = cleanWebsiteUrlInput(input);
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

function cleanWebsiteUrlInput(input: string) {
  return input
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/^https?\/\//i, (match) => `${match.slice(0, -2)}://`)
    .replace(/^https?:\/(?!\/)/i, (match) => `${match}/`)
    .replace(/^https?:\/\//i, (match) => match.toLowerCase())
    .replace(/\s+/g, "")
    .replace(/[。．｡]/g, ".");
}
