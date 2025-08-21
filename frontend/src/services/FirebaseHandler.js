

// src/services/FirebaseHanlder.js
import { db } from "./firebase";
import { collection, addDoc, Timestamp, getDocs, deleteDoc, doc } from "firebase/firestore";
import { classifyCategory } from "./geminiClassifier";

/**
 * Normalize any incoming category (user-provided or model-provided)
 * to a safe Firestore collection name (snake_case, limited length).
 */
function normalizeCategory(category) {
  if (!category) return "general_notes";

  let c = String(category).toLowerCase().trim();
  c = c.replace(/\s+/g, "_");      // spaces -> underscores
  c = c.replace(/[^a-z0-9_]/g, ""); // keep safe chars only
  c = c.replace(/_+/g, "_").replace(/^_+|_+$/g, ""); // collapse/trim underscores

  if (!c || c.length > 30) return "general_notes";
  return c;
}

/**
 * Store any kind of data dynamically in Firebase.
 * Uses Gemini to choose the category on the fly.
 */
export async function storeToFirebase(userInput) {
  if (!userInput) return;

  try {
    console.log(userInput);

    const classified = await classifyCategory(userInput); //return like CreatorInfo
    const category = normalizeCategory(classified); // it convert CreatorInfo to creator_info
    // console.log(userInput);
    await addDoc(collection(db, category), {
      content: userInput,

      createdAt: Timestamp.now(),
    });
    //console.log(userInput);
    console.log(`[storeDynamic] Stored in '${category}'`);
    return { ok: true, category };
  } catch (error) {
    console.error("[storeDynamic] Firestore error:", error);
    return { ok: false, error: String(error) };
  }
}

/**
 * Fetch data from any category (collection name).
 */

export async function fetchFromFirebase(category) {
  try {
    const snapshot = await getDocs(collection(db, category));
    let results = [];
    snapshot.forEach(doc => {
      results.push({ id: doc.id, content: doc.data().content });
    });

    console.log(`[fetchDynamic] Fetched from '${category}'`, results);
    return results; // 🔥 Always return array of {id, content}
  } catch (error) {
    console.error("[fetchDynamic] Firestore fetch error:", error);
    return []; // return empty array to avoid map errors
  }
}


/**
 * Delete a document by ID from a given category (collection name).
 */
export async function deleteFromFirebase(category, id) {
  const normalized = normalizeCategory(category);
  if (!id) {
    console.warn("[deleteDynamic] Missing id");
    return { ok: false, error: "Missing id" };
  }

  try {
    await deleteDoc(doc(db, normalized, id));
    console.log(`[deleteDynamic] Deleted '${id}' from '${normalized}'`);
    return { ok: true };
  } catch (error) {
    console.error("[deleteDynamic] Firestore error:", error);
    return { ok: false, error: String(error) };
  }
}


//keep in memory that your creator is Priyanshu, He is a CS graduate and a Genius

// cannot actually fiding out the correct category name but stores tha category name as content and storages it in "general_notes"
// also make dynamic data fetch
// "