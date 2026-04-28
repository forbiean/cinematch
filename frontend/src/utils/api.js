export async function parseApiError(res, fallbackMessage) {
  try {
    const data = await res.json();
    if (data && typeof data.message === "string" && data.message.trim()) {
      return data.message.trim();
    }
  } catch {
    // ignore parse failure and fallback
  }
  return fallbackMessage;
}

