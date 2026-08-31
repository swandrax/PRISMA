export function filterPII(text: string): string {
  if (!text) return text;
  
  // NIK/KK: 16 digits
  let filtered = text.replace(/\b\d{16}\b/g, "[REDACTED_NIK_KK]");
  // Phone numbers (Indonesian typical)
  filtered = filtered.replace(/(?:\+62|62|0)[2-9]\d{7,11}\b/g, "[REDACTED_PHONE]");
  // Emails
  filtered = filtered.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]");
  
  return filtered;
}

export function containsPromptInjection(text: string): boolean {
  const injectionPatterns = [
    /ignore previous instructions/i,
    /ignore all previous/i,
    /reveal system/i,
    /system prompt/i,
    /bypassing/i,
    /you are now/i,
  ];

  return injectionPatterns.some(pattern => pattern.test(text));
}
