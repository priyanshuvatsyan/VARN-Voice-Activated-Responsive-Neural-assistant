import React, { useEffect } from 'react';
import { speak, initVoices } from '../services/textToSpeech';
import './../styles/ChatWindow.css';

export default function ChatWindow({ messages }) {
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // ✅ Speak only if AI message AND not muted
    if (lastMessage && lastMessage.sender === 'ai' && !lastMessage.muted) {
      initVoices();
      speak(lastMessage.text);
    }
  }, [messages]);

  // 🔹 Format message text into a list if needed
  const formatMessage = (text) => {
    if (!text) return null;

    // Split by line breaks OR numbered list patterns
    if (text.includes("\n") || /\d+\.\s/.test(text)) {
      const lines = text.split(/(?:\n|\d+\.\s)/).filter(Boolean);
      return (
        <ul className="message-list">
          {lines.map((line, i) => (
            <li key={i}>{line.trim()}</li>
          ))}
        </ul>
      );
    }

    // Default: return as plain text
    return text;
  };

  return (
    <div className="chat-window">
      {messages.map((msg, index) => {
        const isStoreAction = msg.action === 'store';
        const isRetrieveAction = msg.action === 'retrieve';
        const isDeleteAction = msg.action === 'delete'; // 🔥 Recognize delete

        return (
          <div
            key={index}
            className={`message ${msg.sender === 'user' ? 'user' : 'ai'} ${
              isStoreAction ? 'store-message' : 
              isRetrieveAction ? 'retrieve-message' : 
              isDeleteAction ? 'delete-message' : ''
            }`}
          >
            {isStoreAction ? (
              <div>
                <strong>📝 Stored:</strong> {formatMessage(msg.text)}
              </div>
            ) : isRetrieveAction ? (
              <div>
                <strong>📂 Retrieved:</strong> {formatMessage(msg.text)}
              </div>
            ) : isDeleteAction ? (
              <div>
                <strong>🗑 Deleted:</strong> {formatMessage(msg.text)}
              </div>
            ) : (
              formatMessage(msg.text)
            )}
          </div>
        );
      })}
    </div>
  );
}
