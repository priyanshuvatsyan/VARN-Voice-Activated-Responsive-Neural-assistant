// src/services/geminiClassifier.js

/**
 * Sanitize a model output into a short snake_case category.
 * - strips labels like "Category:"
 * - removes quotes and punctuation
 * - lowercases, trims, spaces -> underscores
 * - keeps only [a-z0-9_], collapses multiple underscores
 * - enforces length & provides a safe fallback
 */
function sanitizeCategory(raw) {
  // Clean up response → snake_case category
    let t = raw
      .replace(/^\s*category\s*[:\-]\s*/i, "")
      .replace(/["'`]/g, "")
      .trim()
      .toLowerCase();

    t = t.split(/\r?\n/)[0]; // only first line
    t = t.replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").replace(/_+/g, "_");
    t = t.replace(/^_+|_+$/g, ""); // trim underscores

    // Fallback to general_notes if invalid
    if (!t || t.length > 30) return "general_notes";
    return t;
}

/**
 * Classifies user input into a short, snake_case category.
 * Returns a safe fallback "general_notes" if uncertain.
 */
export async function classifyCategory(userInput) {
  try {

    const prompt = `
Return ONLY a category label for the text below with these rules:
- short (<= 3 words), snake_case
- no quotes, no prefixes, no extra text
- examples: tasks, notes, workout_routine, shopping_list, birthday_reminder, memory, ideas
- if no obvious fit, return general_notes

Text:
${userInput}

Category:
`;

    const response = await fetch("http://localhost:5000/api/gemini",{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userContent: prompt
      })
    })

   const data = await response.json();

   // Extract model response text safely
   let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return sanitizeCategory(raw);

  } catch (err) {
    console.error("[classifyCategory] Gemini error:", err);
    return "general_notes";
  }
}
