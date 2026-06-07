import { useState } from "react";
import ReactMarkdown from "react-markdown";
//import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
//im+port { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = {
      role: "user",
      text: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await res.json();

      const botMessage = {
        role: "bot",
        text: data.answer,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Server Error",
        },
      ]);
    }

    setQuestion("");
    setLoading(false);
  };

  return (
    <div className="app">
      <div className="chat-container">

        <div className="header">
          <h1>DSA Mentor AI</h1>
          <p>Your personal Data Structures & Algorithms tutor</p>
        </div>

        <div className="chat-box">
          {messages.length === 0 && (
            <div className="welcome">
              Ask anything about DSA 🚀
            </div>
          )}

          {messages.map((msg, index) => (
  <div
    key={index}
    className={`message ${
      msg.role === "user"
        ? "user-message"
        : "bot-message"
    }`}
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children }) {
          const match = /language-(\w+)/.exec(
            className || ""
          );

          if (!inline && match) {
            return (
              <pre className="code-block">
                <code>
                  {String(children)}
                </code>
              </pre>
            );
          }

          return (
            <code className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {msg.text}
    </ReactMarkdown>
  </div>
))}

          {loading && (
            <div className="bot-message">
              Thinking...
            </div>
          )}
        </div>

        <div className="input-area">
          <textarea
            placeholder="Ask a DSA question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <button onClick={askQuestion}>
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;