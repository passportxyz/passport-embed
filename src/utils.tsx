// Format to integer
export const displayNumber = (num?: number): string => {
  if (!num) return "0";
  return String(Math.abs(num) < 1 ? num.toFixed(1) : parseInt(num.toString()));
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred";
};
