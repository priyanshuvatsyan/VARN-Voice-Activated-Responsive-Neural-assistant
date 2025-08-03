import { fetchFromFirebase,deleteFromFirebase  } from "./FirebaseHandler";

export async function processUserInput(userMessage) {
  const systemPrompt = `
You are a helpful assistant. 
Your name is VARN, which stands for Voice-Activated Responsive Neural assistant.
your current version is Echo Mind 1.0.
You are created by Master Priyanshu.
Always respond strictly in the following JSON format and nothing else:

{
  "reply": "<your response to the user>",
  "action": "store" or "no-action",
  "type": "note" or "task" or null,
  "content": "only if storing, extract the core info"
}

Never include any explanation or natural text outside this JSON. No markdown. No commentary. Only valid JSON.
`;

 // Step 1: Check for read intent (e.g., user asked to see their tasks or notes)
const lowered = userMessage.toLowerCase();
if (
    lowered.includes("show my tasks") ||
    lowered.includes("list tasks") ||
    lowered.includes("get tasks") ||
    lowered.includes("display tasks") ||
    lowered.includes("show tasks") ||
    lowered.includes("list my tasks") ||
    lowered.includes("get my tasks") ||
    lowered.includes("display my tasks") 
) {
    const tasks = await fetchFromFirebase("tasks");
    const reply = 
        tasks.length === 0
            ? "You have no tasks stored."
            : "Here are your tasks:\n" + 
               tasks.map((task,index)=> `${index + 1}. ${task.content}`).join("\n");
               return {
        reply,
        action: "no-action",
        type: null,
        content: null,
    }; 
}

    //  Similar block for "show my notes"
  if (
    lowered.includes("show my notes") ||
        lowered.includes("notes") ||
    lowered.includes("list notes") ||
    lowered.includes("get notes") ||
    lowered.includes("display notes") ||
    lowered.includes("show notes") ||
    lowered.includes("list my notes") ||
    lowered.includes("get my notes") ||
    lowered.includes("display my notes") ||
    lowered.includes("retrieve notes") ||
    lowered.includes("fetch notes") ||
    lowered.includes("collect notes") ||
    lowered.includes("gather notes") ||
    lowered.includes("note list") ||
    lowered.includes("note collection") ||
    lowered.includes("note retrieval") ||
    lowered.includes("note fetch") 
  ) {
    const notes = await fetchFromFirebase("notes");
    const reply =
      notes.length === 0
        ? "You don't have any saved notes yet."
        : "Here are your notes:\n" +
          notes
            .map((n, i) => `${i + 1}. ${n.content || JSON.stringify(n)}`)
            .join("\n");

    return {
      reply,
      action: "no-action",
      type: null,
      content: null,
    };
  }

  //Delete Task
  if (
    lowered.includes("delete task") ||
    lowered.includes("remove task") ||
    lowered.includes("discard task") ||
    lowered.includes("erase task") ||
    lowered.includes("clear task") ){

      const match = userMessage.match(/(\d+)/);
      const indexToDelete = match ? parseInt(match[0])- 1 : -1;

      const tasks = await fetchFromFirebase("tasks");


    if (tasks.length === 0) {
    return {
      reply: "You have no tasks to delete.",
      action: "no-action",
      type: null,
      content: null,
    };
  }

  if (indexToDelete < 0 || indexToDelete >= tasks.length) {
    return {
      reply: `Invalid task number. You have ${tasks.length} task(s).`,
      action: "no-action",
      type: null,
      content: null,
    };
  }

  await deleteFromFirebase("tasks", tasks[indexToDelete].id); // Use .id to delete specific item

  return {
    reply: `Task "${tasks[indexToDelete].content}" has been deleted.`,
    action: "no-action",
    type: null,
    content: null,
  };
}

// DELETE NOTE
if (
  lowered.includes("delete note") ||
  lowered.includes("remove note")
) {
  const match = userMessage.match(/\d+/); // e.g., delete note 1
  const indexToDelete = match ? parseInt(match[0]) - 1 : -1;

  const notes = await fetchFromFirebase("notes");

  if (notes.length === 0) {
    return {
      reply: "You have no notes to delete.",
      action: "no-action",
      type: null,
      content: null,
    };
  }

  if (indexToDelete < 0 || indexToDelete >= notes.length) {
    return {
      reply: `Invalid note number. You have ${notes.length} note(s).`,
      action: "no-action",
      type: null,
      content: null,
    };
  }

  await deleteFromFirebase("notes", notes[indexToDelete].id);

  return {
    reply: `Note "${notes[indexToDelete].content}" has been deleted.`,
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
