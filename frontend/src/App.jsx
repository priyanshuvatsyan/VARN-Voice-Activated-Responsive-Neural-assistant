// App.jsx

/**
 * VARN: Echo Mind v1.0 */

import ChatWindow from './components/ChatWindow';
import TextInput from './components/TextInput';
import { useState } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);

  const handleNewMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };



  return (
    <div className="flex flex-col h-screen">
      <ChatWindow messages={messages} />
      <TextInput onMessage={handleNewMessage} />
    </div>
  );
}
