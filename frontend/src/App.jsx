import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
//import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
//im+port { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const chatBoxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop =
        chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  /*useEffect(() => {
    const createChat = async () => {
      try {
        const res = await fetch("http://localhost:3000/chats", {
          method: "POST",
        });

        const data = await res.json();

        setCurrentChatId(data._id);
      } catch (err) {
        console.error(err);
      }
    };

    createChat();
  }, []);*/

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch("http://localhost:3000/chats");
      const data = await res.json();
      setChats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadChat = async (chatId) => {
    try {
      const res = await fetch(`http://localhost:3000/chats/${chatId}`);
      const data = await res.json();
      setCurrentChatId(data._id);
      setMessages(data.messages);
    } catch (err) {
      console.log(err);
    }
  };

  const createNewChat = async () => {
    try {
      const res = await fetch("http://localhost:3000/chats", { method: "POST" });
      const data = await res.json();
      setCurrentChatId(data._id);
      setMessages([]);
      fetchChats();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await fetch(`http://localhost:3000/chats/${chatId}`, {
        method: "DELETE",
      });

      fetchChats();
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
    }
    catch (err) {
      console.error(err);
    }
  }

  const askQuestion = async () => {
    if (!question.trim()) return;
    if (!currentChatId) return;

    const userMessage = {
      role: "user",
      text: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    setQuestion("");

    try {
      const res = await fetch(`http://localhost:3000/chats/${currentChatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
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
    await fetchChats();
    setLoading(false);
  };

  return (
    <div className="app">

      <div className="sidebar">

        <button className="new-chat-btn" onClick={createNewChat}>
          + New Chat
        </button>

        <input type="text" className="search-chat" placeholder="Search chats..." value={searchQuery}
          onChange={(e) => { setsearchQuery(e.target.value) }} />

        {chats.filter((chat) => (chat.title || "").toLowerCase().includes(searchQuery.toLowerCase()))
          .map((chat) => (
            <div
              key={chat._id}
              className={
                currentChatId === chat._id ? "chat-item active-chat" : "chat-item"
              }
              onClick={() => {
                //console.log("clicked", chat._id);
                loadChat(chat._id);
              }}
            >
              <span className="chat-item-title">{chat.title}</span>
              <button className="delete-btn" onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Delete this chat?"))
                  deleteChat(chat._id);
              }}>🗑</button>
            </div>
          ))}

        {chats.length === 0 && (<p className="empty-sidebar">No chats yet</p>)}

      </div>
      <div className="chat-container">

        <div className="header">
          <h1>DSA Mentor AI</h1>
          <p>Your personal Data Structures & Algorithms tutor</p>
        </div>

        <div className="chat-box" ref={chatBoxRef}>
          {messages.length === 0 && (
            <div className="welcome">
              Ask anything about Data Structures and Algo
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role === "user"
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