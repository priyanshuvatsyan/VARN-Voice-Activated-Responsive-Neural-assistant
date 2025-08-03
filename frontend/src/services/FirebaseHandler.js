import {db} from './firebase'; 
import {collection, addDoc,Timestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';


/**
 * 2 categories are being stored to Firebase Firestore.
 * notes
 * tasks
 * 
 * */


export async function storeToFirebase(type, content){

    if (!type || !content) {
        return;
    }

    /* If the type is 'task', it'll save to a "tasks" collection.
        If it's anything else (usually 'note'), it'll save to "notes". */
    const collectionName = type === 'task'? 'tasks' : 'notes';
    try {
        await addDoc(collection(db, collectionName), {
            content,
            createdAt: Timestamp.now()
        });
        console.log(`Data stored successfully in collection.`);
        
    } catch (error) {
        console.error("Error storing data to Firebase:", error);
        return;
    }
} 

// Fetching all notes or tasks from Firebase
export async function fetchFromFirebase(type){
    const result = [];
    try {
        const querySnapshot = await getDocs(collection(db,type));
        querySnapshot.forEach((doc)=>{
            result.push({
                id: doc.id,
                ...doc.data()
            })
        })
        return result;
    } catch (error) {
        console.log("Error fetching data from Firebase:", error);
        return []; // Return an empty array on error
    }
}

// delete notes and tasks from Firebase
export async function deleteFromFirebase(type, id) {
    try {
        await deleteDoc(doc(db, type, id));
        console.log(`Data with ID ${id} deleted successfully from ${type} collection.`);
    } catch (error) {
        console.error("Error deleting data from Firebase:", error);
        
    }
}