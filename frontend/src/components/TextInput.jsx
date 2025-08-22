import React, { useState, useRef, useEffect } from 'react';
import stringSimilarity from "string-similarity";
import { processUserInput } from '../services/GeminiProcessor';
import { storeToFirebase, fetchFromFirebase, deleteFromFirebase } from '../services/FirebaseHandler';
import './../styles/TextInput.css';

export default function TextInput({ onMessage, onToggleMute }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [muted, setMuted] = useState(true); // ✅ Default muted
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support Speech Recognition');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    const possibleMatches = ["barn", "burn", "warn", "von", "van", "run", "ron", "vaughn", "world", "war"];

    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;
      const words = transcript.split(' ');
      const correctedWords = words.map(word => {
        const bestMatch = stringSimilarity.findBestMatch(word.toLowerCase(), possibleMatches);
        return bestMatch.bestMatch.rating > 0.5 ? "VARN" : word;
      });
      setInput(correctedWords.join(' '));
    };

    recognitionRef.current = recognition;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    onMessage({ sender: 'user', text: input });
    setLoading(true);

    const result = await processUserInput(input);
    setInput('');
    setLoading(false);

    // ✅ Send AI response with mute flag
    onMessage({ sender: 'ai', text: result.reply, action: result.action, muted });

    if (result.action === 'store') {
      await storeToFirebase(result.content);
      onMessage({ sender: 'ai', text: result.content, action: 'store', muted });
    } 
    else if (result.action === 'retrieve') {
      const fetched = await fetchFromFirebase(input);
      onMessage({
        sender: 'ai',
        text: fetched.ok
          ? `Here’s what I found in ${fetched.category}:\n` +
          fetched.results.map((r, i) => `${i + 1}. ${r.content}`).join("\n")
          : "Sorry, I couldn't fetch that.",

        action: 'retrieve',
        muted
      });
    }
    else if (result.action === 'delete'){
      const deleted = await deleteFromFirebase(input);
      onMessage({
        sender: 'ai',
        text: deleted.ok
          ? `Deleted item from ${deleted.category}.`
          : "Sorry, I couldn't delete that.",
          action: 'delete',
          muted
    });
  }
  }
  const handleVoiceInput = () => {
    if (!recognitionRef.current) return;
    listening ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  const toggleMute = () => {
    setMuted(prev => {
      const newValue = !prev;
      if (onToggleMute) onToggleMute(newValue); // ✅ Always pass latest value
      return newValue;
    });
  };

  return (
    <form className="text-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type or speak..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />

      {/* Mic Button */}
      <button
        type="button"
        onClick={handleVoiceInput}
        className={`speak-button ${listening ? 'listening' : ''}`}
        aria-label={listening ? 'Stop listening' : 'Start listening'}
      >

      </button>

      {/* Mute Button */}
      <button
        type="button"
        onClick={toggleMute}
        className={`mute-button ${muted ? 'muted' : ''}`}
        aria-label={muted ? 'Unmute voice' : 'Mute voice'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {/* Send Button */}
      <button
        type="submit"
        disabled={loading}
        className="send-button"
      >
        {loading ? 'Thinking...' : '➤'}
      </button>
    </form>
  );
}
