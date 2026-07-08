import React, { useState, useRef, useEffect } from 'react';
import './index.css';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'agent',
      content: 'Xin chào RM. Tôi là trợ lý AI tích hợp hệ thống CRM của Bank A. Tôi có thể giúp gì cho bạn hôm nay?',
      context: null
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      context: null
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'agent',
        content: data.reply,
        context: data.context || null
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'agent',
        content: 'Xin lỗi, không thể kết nối tới máy chủ AI. Vui lòng kiểm tra lại kết nối.',
        context: 'Lỗi hệ thống'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (text) => {
    setInput(text);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Bank A Co-Pilot
        </div>
        <div className="history-list">
          <div className="history-item active">Hội thoại hiện tại</div>
          <div className="history-item">Hồ sơ khách Nguyễn Văn An</div>
          <div className="history-item">Tư vấn thẻ tín dụng KH002</div>
        </div>
      </aside>

      {/* Main Chat */}
      <main className="chat-container">
        <header className="chat-header">
          <h1>Trợ lý AI - CRM</h1>
          <p>Tích hợp trực tiếp dữ liệu Sandbox qua Model Context Protocol</p>
        </header>

        <div className="messages-area">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.context && (
                  <div className="context-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    Context: {msg.context}
                  </div>
                )}
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message agent">
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="quick-actions">
            <button className="action-btn" onClick={() => handleQuickAction('Nhắc tôi những KH có sổ tiết kiệm đến hạn tuần này.')}>Nhắc KH đến hạn</button>
            <button className="action-btn" onClick={() => handleQuickAction('Khách KH001 có cơ hội mua chéo sản phẩm nào không?')}>Cơ hội mua chéo KH001</button>
            <button className="action-btn" onClick={() => handleQuickAction('Soạn email giới thiệu thẻ tín dụng cho KH002.')}>Soạn email</button>
          </div>

          <div className="input-wrapper" style={{ marginTop: '0.75rem' }}>
            <textarea
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập yêu cầu bằng tiếng Việt tự nhiên (VD: Hãy soạn email cho khách hàng...)"
              rows={1}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
