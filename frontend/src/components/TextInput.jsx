import React from 'react'
import { useState } from 'react';
import { processUserInput } from '../services/GeminiProcessor';
import { storeToFirebase } from '../services/FirebaseHandler'; // We'll create this next

export default function TextInput({onMessage}) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!input.trim()) return; // Ignore empty input

        //send user input to chatlog
        onMessage({ sender: 'user', text: input });
        setLoading(true);

        const result = await processUserInput(input);
        setInput(''); // Clear input field
        setLoading(false);

        //send Gemini's response to parent
        onMessage({ sender: 'ai', text: result.reply });
        // If Gemini suggests storing something, handle it
        if (result.action === 'store') {
        await storeToFirebase(result.type, result.content);
        }
    }


  return (
    <div>
         <form onSubmit={handleSubmit} className="w-full flex gap-2 p-2">
      <input
        type="text"
        placeholder="Type something..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 border border-gray-300 rounded-lg p-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        {loading ? 'Thinking...' : 'Send'}
      </button>
    </form>
  );
    </div>
  )
}
