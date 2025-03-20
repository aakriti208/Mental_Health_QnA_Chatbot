import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const userMessage = { text: query, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);

    // Fetch response from backend
    try {
      const res = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      const botMessage = { text: data.response, sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { text: 'I don’t have an answer for that right now.', sender: 'bot' };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setQuery('');
  };

  return (
    <div className="App">
      <div className="chat-container">
        <h1>Mental Health Chatbot</h1>
        <div className="chat-window">
          {messages.length === 0 ? (
            <p className="welcome">Ask me anything about mental health!</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                {msg.text}
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        <form className="input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;