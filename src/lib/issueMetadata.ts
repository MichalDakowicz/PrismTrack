export interface IssueDateMetadata {
  startDate?: string;
  endDate?: string;
  dueDate?: string;
}

const START_MARKER = "<!-- prismtrack:auto-dates:start -->";
const END_MARKER = "<!-- prismtrack:auto-dates:end -->";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function normalizeDate(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed || !DATE_RE.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function normalizeIssueDateMetadata(input: unknown): IssueDateMetadata {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  const metadata: IssueDateMetadata = {
    startDate: normalizeDate(source.startDate),
    endDate: normalizeDate(source.endDate),
    dueDate: normalizeDate(source.dueDate),
  };

  if (!metadata.startDate) {
    delete metadata.startDate;
  }
  if (!metadata.endDate) {
    delete metadata.endDate;
  }
  if (!metadata.dueDate) {
    delete metadata.dueDate;
  }

  return metadata;
}

export function hasIssueDateMetadata(metadata: IssueDateMetadata): boolean {
  return !!(metadata.startDate || metadata.endDate || metadata.dueDate);
}

function stripTrailingWhitespace(body: string): string {
  return body.replace(/\s+$/g, "");
}

export function stripIssueMetadataSection(body: string | null | undefined): string {
  const text = body || "";
  const sectionRe = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`, "g");
  const withoutSection = text.replace(sectionRe, "");
  return stripTrailingWhitespace(withoutSection);
}

export function extractIssueDateMetadata(body: string | null | undefined): {
  cleanBody: string;
  metadata: IssueDateMetadata;
} {
  const text = body || "";
  const sectionRe = new RegExp(`${START_MARKER}([\\s\\S]*?)${END_MARKER}`, "m");
  const match = text.match(sectionRe);

  if (!match) {
    return {
      cleanBody: stripTrailingWhitespace(text),
      metadata: {},
    };
  }

  let parsed: unknown = {};
  try {
    parsed = JSON.parse(match[1].trim());
  } catch {
    parsed = {};
  }

  return {
    cleanBody: stripIssueMetadataSection(text),
    metadata: normalizeIssueDateMetadata(parsed),
  };
}

export function composeIssueBodyWithMetadata(
  body: string | null | undefined,
  metadata: IssueDateMetadata,
): string {
  const cleanBody = stripIssueMetadataSection(body);
  const normalized = normalizeIssueDateMetadata(metadata);

  if (!hasIssueDateMetadata(normalized)) {
    return cleanBody;
  }

  const metadataJson = JSON.stringify(normalized, null, 2);
  const separator = cleanBody ? "\n\n" : "";

  return `${cleanBody}${separator}${START_MARKER}\n${metadataJson}\n${END_MARKER}`;
}
