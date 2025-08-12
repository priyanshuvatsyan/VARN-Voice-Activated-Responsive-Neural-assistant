import React from 'react'
import stringSimilarity from "string-similarity"; // correcting other words to VARN
import { useState, useRef, useEffect } from 'react';
import { processUserInput } from '../services/GeminiProcessor';
import { storeToFirebase } from '../services/FirebaseHandler'; // We'll create this next

export default function TextInput({onMessage}) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [listening, setListening] = useState(null);
    const recognitionRef  = useRef(null);

    // Initialize SpeechRecognition
    useEffect(() => {
      
       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Your browser does not support Speech Recognition');
      return;
    }
    
    const recognition = new SpeechRecognition();
      recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };

    const possibleMatches = ["barn", "burn", "warn", "von", "van", "run", "ron", "vaughn", "world", "war"];

    recognition.onresult = (event) => {
        let transcript = event.results[0][0].transcript;
        console.log(transcript);

        const words = transcript.split(' ');
        // Correct words to VARN if they are similar
        const correctedWords = words.map(word=>{
          const bestMatch = stringSimilarity.findBestMatch(word.toLowerCase(), possibleMatches);
          if (bestMatch.bestMatch.rating > 0.5) {
            return "VARN"; // if similar enough, correct to VARN
          }
          return word; // otherwise, keep the original word
        })
        const correctedInput = correctedWords.join(' ');
        setInput(correctedInput);
    }
        recognitionRef.current = recognition;
    }, [])
    

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

     const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (!listening) {
        recognitionRef.current.start();
      } else {
        recognitionRef.current.stop();
      }
    }
  };

  return (
     <div>
      <form onSubmit={handleSubmit} className="w-full flex gap-2 p-2">
        <input
          type="text"
          placeholder="Type or speak..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg p-2"
        />
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`px-4 py-2 rounded-lg ${listening ? 'bg-red-500' : 'bg-green-500'} text-white`}
        >
          {listening ? 'Stop' : '🎤'}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
