/**
 * Large language model helper functions. In production this would call the OpenAI API. In demo mode we return canned responses.
 */
export async function generateTitleSuggestions(title: string): Promise<string[]> {
  // Remove special chars and propose a few variations
  const base = title.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  return [
    `${base} – Updated`,
    `${base} (Improved)`,
    `New ${base}`,
  ];
}

export async function generateOutreachDraft(storeName: string): Promise<{ subject: string; firstLine: string; emailBody: string; dmBody: string }> {
  return {
    subject: `Fix your Google Shopping disapprovals for ${storeName}`,
    firstLine: `Hi ${storeName} team,`,
    emailBody: `Hi ${storeName} team,\n\nWe noticed some issues with your product listings on Google Shopping. FeedDoctor can help you quickly get your products approved by generating a corrected feed and a clear checklist.\n\nBest,\nFeedDoctor`,
    dmBody: `Hi! We spotted a few feed issues on your products. FeedDoctor can help you fix them fast. Visit our site for a free scan.`,
  };
}