import React from 'react'

export default function ChatWindow({ messages }) {
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
