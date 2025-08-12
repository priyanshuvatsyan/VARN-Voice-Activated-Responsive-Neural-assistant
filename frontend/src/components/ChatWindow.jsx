import React, { useEffect } from 'react'
import { speak, initVoices } from '../services/textToSpeech'
import { speakWithElevenLabs } from '../../../server/elevenLabs';

export default function ChatWindow({ messages }) {

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'ai') 
      {
        initVoices()
      speak(lastMessage.text);
      }
  }, [messages]);

  return (
    <div>
         <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
            {
                messages.map((msg,index)=>(
                     <div
          key={index}
          className={`mb-2 p-2 rounded-lg ${
            msg.sender === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'
          }`}
        >
          {msg.text}
        </div>
                ))
            }
         </div>
    </div>
  )
}
