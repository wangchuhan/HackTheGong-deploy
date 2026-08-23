/** Parse QR / manual scan payloads into BIN-xxx or DISP-xxx codes. */
export function parseScannedCode(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // Plain code
  if (/^(BIN|DISP)-/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  try {
    const url = new URL(trimmed);
    const codeParam =
      url.searchParams.get("code") ??
      url.searchParams.get("bin") ??
      url.searchParams.get("id");
    if (codeParam) return parseScannedCode(codeParam);

    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (last && /^(BIN|DISP)-/i.test(last)) {
      return last.toUpperCase();
    }
  } catch {
    // not a URL — try path-like strings
    const match = trimmed.match(/(BIN-\d{3}|DISP-[A-Z0-9-]+)/i);
    if (match) return match[1].toUpperCase();
  }

  return trimmed.toUpperCase();
}
