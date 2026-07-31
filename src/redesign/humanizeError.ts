/*
 * humanizeError - map a failure to friendly, human copy (§ score states / copy).
 *
 * The score window NEVER shows a raw `error.message`. Every failure is mapped to
 * a short title, a plain one-sentence explanation, and whether a retry is worth
 * offering. Callers pass either a known kind or an unknown thrown value (an axios
 * error, a DOMException, a string); we sniff the kind from it. Copy is deliberately
 * simple and dash free.
 */

export type ErrorKind = "network" | "rate-limit" | "timeout" | "unknown";

export type HumanError = {
  kind: ErrorKind;
  /** Short headline for the error state. */
  title: string;
  /** One plain sentence the user can act on. */
  message: string;
  /** Whether a retry affordance should be shown. */
  retryable: boolean;
};

const COPY: Record<ErrorKind, Omit<HumanError, "kind">> = {
  network: {
    title: "No connection",
    message: "We could not reach the network. Check your connection and try again.",
    retryable: true,
  },
  "rate-limit": {
    title: "Too many requests",
    message: "You have made a lot of requests. Wait a moment, then try again.",
    retryable: true,
  },
  timeout: {
    title: "This is taking too long",
    message: "The request timed out before we heard back. Try again.",
    retryable: true,
  },
  unknown: {
    title: "Something went wrong",
    message: "We could not load your score just now. Try again.",
    retryable: true,
  },
};

/** Best-effort sniff of an error kind from an unknown thrown value. */
export const classifyError = (input: unknown): ErrorKind => {
  if (input == null) return "unknown";

  // A numeric-ish status (429) anywhere on the value.
  const status =
    typeof input === "object" && input !== null
      ? // axios shape: err.response.status, or err.status
        (input as { response?: { status?: number }; status?: number }).response?.status ??
        (input as { status?: number }).status
      : undefined;
  if (status === 429) return "rate-limit";
  if (status === 408 || status === 504) return "timeout";

  const text = (
    typeof input === "string"
      ? input
      : input instanceof Error
        ? `${input.name} ${input.message}`
        : (() => {
            try {
              return JSON.stringify(input);
            } catch {
              return String(input);
            }
          })()
  ).toLowerCase();

  if (/429|rate.?limit|too many/.test(text)) return "rate-limit";
  if (/time?out|timed out|deadline|abort/.test(text)) return "timeout";
  if (/network|failed to fetch|offline|dns|econn|enotfound|connection/.test(text)) return "network";
  return "unknown";
};

/** Map a kind, or an unknown thrown value, to friendly error copy. */
export const humanizeError = (input: ErrorKind | unknown): HumanError => {
  const kind: ErrorKind =
    input === "network" || input === "rate-limit" || input === "timeout" || input === "unknown"
      ? input
      : classifyError(input);
  return { kind, ...COPY[kind] };
};
