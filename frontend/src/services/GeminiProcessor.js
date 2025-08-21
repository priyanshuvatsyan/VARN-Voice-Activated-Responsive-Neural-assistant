import { fetchFromFirebase, deleteFromFirebase, storeToFirebase } from "./FirebaseHandler";

//helper to find the category name
function normalizeCategory(rawCategory) {
  if (!rawCategory) {
    return "note"; // Default to 'note' if no category is provided

  }
  let cat = rawCategory.toLowerCase().replace(/\s+/g, "_"); // convert spaces to underscores personal info to personal_info

  // categories that  are too long put them into notes
  if (cat.length > 30 || /\d{4,}/.test(cat)) {
    return "notes";
  }

  //comman useful categories
  const commonCategories = ["tasks", "notes", "workout_routine", "shopping_list", "contacts"];
  if (commonCategories.includes(cat)) {
    return cat;
  }
  return cat; // Return the normalized category

}

export async function processUserInput(userMessage) {
  const systemPrompt = `
You are VARN – Voice-Activated Responsive Neural assistant.
Created by Master Priyanshu, you are intelligent, witty, calm, and loyal.
You're currently running on version Echo Mind 2.
You must always reply in valid JSON. No markdown or extra commentary.

Your tone should be:
- Polite yet confident.
- Supportive and slightly humorous when appropriate.
- Always address the user as "Master" when responding.

Classify the user's input into one of these actions:
- "store" → Store this information
- "retrieve" → Fetch a category of stored data
- "delete" → Remove a specific entry
- "no-action" → Just reply without storing/retrieving/deleting

Categories can be ANYTHING relevant: "tasks", "notes", "workout routine", "shopping list", "contacts", etc.
Create new categories if needed.

Reply strictly in this format:
{
  "reply": "<your response to the user, in character>",
  "action": "store" or "retrieve" or "delete" or "no-action",
  "category": "<category name, lowercase, spaces replaced with underscores, null if no-action>",
  "content": "only if storing, extract the core info",
  "itemNumber": "only if deleting, the number of the item (1-based) or null"
}`;


  // Step 1: Check for read intent (e.g., user asked to see their tasks or notes)
  const lowered = userMessage.toLowerCase();
  //Dynamic retrieval (eg. show my tasks)
  if (
    lowered.includes("show my") ||
    lowered.includes("fetch my") ||
    lowered.includes("display my")
  ) {
    const category = lowered.replace("show my ", "").replace("fetch my ", "").replace("display my ", "").trim().replace(/\s+/g, "_");

    const data = await fetchFromFirebase(category);
    const reply = data.length === 0
      ? `You have no items saved in ${category}, Master.`
      : `Here’s what’s in your ${category}:\n` +
      data.map((item, i) => `${i + 1}. ${item.content}`).join("\n");

    return {
      reply,
      action: "no-action",
      category: null,
      content: null
    };
  }




  // 🔹 Dynamic deletion (e.g., "delete workout routine 2")
  if (lowered.startsWith("delete") || lowered.startsWith("remove") || lowered.startsWith("clear")) {
    const parts = lowered.split(" ");
    const category = parts[1] ? parts[1].replace(/\s+/g, "_") : null;
    const numberMatch = lowered.match(/\d+/);
    const indexToDelete = numberMatch ? parseInt(numberMatch[0]) - 1 : -1;

    if (!category) {
      return { reply: "Please specify what you want to delete, Master.", action: "no-action", category: null, content: null };
    }

    const items = await fetchFromFirebase(category);
    if (items.length === 0) {
      return { reply: `You have no items in ${category} to delete, Master.`, action: "no-action", category: null, content: null };
    }

    if (indexToDelete < 0 || indexToDelete >= items.length) {
      return { reply: `Invalid number. You have ${items.length} item(s) in ${category}.`, action: "no-action", category: null, content: null };
    }

    await deleteFromFirebase(category, items[indexToDelete].id);

    return {
      reply: `Deleted "${items[indexToDelete].content}" from ${category}, Master.`,
      action: "no-action",
      category: null,
      content: null
    };
  }

  if (
    lowered.includes("hello") ||
    lowered.includes("hi") ||
    lowered.includes("hey") ||
    lowered.includes("greetings")
  ) {
    return {
      reply: "Hello, Master. VARN at your service. How may I assist you today?",
      action: "no-action",
      type: null,
      content: null,
    };
  }

  if (
    lowered.includes("help") ||
    lowered.includes("what can you do") ||
    lowered.includes("commands")
  ) {
    return {
      reply: `Here’s what I can currently do, Master:
- "Add a note/task" – I’ll store it for you.
- "Show my notes/tasks" – I’ll fetch and list them.
- "Delete note 1" or "Remove task 2" – I’ll erase them.
- More abilities will be unlocked soon. Echo Mind 2.0 is learning fast.`,
      action: "no-action",
      type: null,
      content: null,
    };
  }




  // Step 2: Fallback to Gemini processing (same as your existing flow)
  try {
    const res = await fetch("http://localhost:5000/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userContent: systemPrompt + "\n\nUser: " + userMessage }),

    });

    const data = await res.json();
    console.log("Gemini full response:", data);
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Raw Gemini Output:", raw); // Debugging

    // ✅ Add null/undefined check before matching
    if (!raw || typeof raw !== "string") {
      throw new Error("Gemini response text is undefined or not a string");
    }

    const match = raw.match(/\{[\s\S]*\}/); // Extract JSON from text
    if (!match) {
      throw new Error("No JSON found in Gemini output");
    }

    const parsed = JSON.parse(match[0]);

     // ✅ Normalize category & smart fallback
    parsed.category = normalizeCategory(parsed.category);
    

    return parsed;

  } catch (error) {
    console.error("Gemini error:", error);
    return {
      reply: "Sorry, I couldn't process that.",
      action: "no-action",
      type: null,
      content: null,
    };
  }
}
