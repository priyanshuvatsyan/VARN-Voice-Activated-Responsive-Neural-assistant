

export async function processUserInput(userMessage) {
  const systemPrompt = `
You are VARN (वर्ण) – Voice-Activated Responsive Neural assistant.
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


  
  const lowered = userMessage.toLowerCase();
  //Dynamic retrieval (eg. show my tasks)
  
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
