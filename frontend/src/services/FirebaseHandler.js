

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

export async function fetchFromFirebase(userInput) {
  try {

    const classified = await classifyCategory(userInput); //return like CreatorInfo
    const category = normalizeCategory(classified); // it convert CreatorInfo to creator_info

    const snapshot = await getDocs(collection(db, category));
    let results = [];
    snapshot.forEach(doc => {
      results.push({ id: doc.id, content: doc.data().content });
    });

    console.log(`[fetchDynamic] Fetched from '${category}'`, results);
    return { ok: true, category, results }; 
  } catch (error) {
    console.error("[fetchDynamic] Firestore fetch error:", error);
   return { ok: false, category: null, results: [] };
  }
}


/**
 * dynamic delete  */
export async function deleteFromFirebase(userInput) {
try {
  const category = await classifyCategory(userInput);

  const snapshot = await getDocs(collection(db,category));
  let items = [];

  snapshot.forEach(doc => {
    items.push({ id: doc.id, content: doc.data().content });
  });

  if (items.length === 0) {
    console.log(`[deleteDynamic] No items found in '${category}' to delete.`);
    return;
  }

  //extract the index
  const match = userInput.match(/\d+/)
  const indexToDelete = match ? parseInt(match[0], 10) - 1 : -1;

  if (indexToDelete < 0 || indexToDelete >= items.length) {
    console.log(`[deleteDynamic] Invalid index to delete: ${indexToDelete + 1}`);
    return;
  }

  //perform delete
  await deleteDoc(doc(db,category,items[indexToDelete].id));
  console.log(`[deleteDynamic] Deleted item ${indexToDelete + 1} from '${category}'`);

  return { ok: true, category, deletedItem: items[indexToDelete] };

} catch (error) {
  console.error("[deleteDynamic] Firestore delete error:", error);
}
}

