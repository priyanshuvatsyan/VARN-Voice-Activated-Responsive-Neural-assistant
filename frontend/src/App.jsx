import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import TextInput from './components/TextInput';
import './styles/App.css'; 

export default function App() {
  const [messages, setMessages] = useState([]);

  const handleNewMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'radial-gradient(circle at center, #0a0f1c, #05070d)',
      color: 'white'
    }}>
      <div style={{ flex: 1 }} />
      <div style={{ width: '40%', display: 'flex', flexDirection: 'column' }}>
        <ChatWindow messages={messages} />
        <TextInput onMessage={handleNewMessage} />
      </div>
    </div>
  );
}
