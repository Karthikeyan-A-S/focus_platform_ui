import { useState, useEffect, useRef, useContext } from "react";
import { ChatContext } from "../../context/ChatProvider";
import { AuthContext } from "../../context/AuthContext";
import { getChatHistory } from "../../api/chatApi";
import api from "../../api/axiosConfig"; 

export default function ChatWindow({
  targetType,
  targetId,
  participants = [],
}) {
  const { stompClient, isConnected } = useContext(ChatContext);
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("GENERAL"); 
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({ GENERAL: 0 }); 
  
  // --- NEW: State to control the sidebar visibility ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const activeTabRef = useRef(activeTab);
  const processedMsgIds = useRef(new Set()); 
  // --- NEW: Auto-scroll to bottom whenever messages load or update ---
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  if (!user) return <div className="flex h-full items-center justify-center text-[var(--text-muted)]">Loading chat...</div>;

  useEffect(() => {
    if (targetType !== "CLASSROOM" || participants.length === 0) return;

    const fetchUnreadCounts = async () => {
      try {
        const genRes = await api.get(`/chat/unread-count?targetType=CLASSROOM&targetId=${targetId}`);
        let counts = { GENERAL: genRes.data };

        for (const p of participants) {
          if (p.id === user.id) continue;
          const dmRes = await api.get(`/chat/unread-count?targetType=CLASSROOM&targetId=${targetId}&dmPartnerId=${p.id}`);
          counts[p.id] = dmRes.data;
        }
        
        setUnreadCounts(counts);
      } catch (error) {
        console.error("Failed to fetch unread counts", error);
      }
    };
    fetchUnreadCounts();
  }, [targetType, targetId, participants, user.id]);

  useEffect(() => {
    if (targetType === "CLASSROOM") {
      const markTabAsRead = () => {
        const dmParam = activeTab === "GENERAL" ? "" : `&dmPartnerId=${activeTab}`;
        api.post(`/chat/read?targetType=CLASSROOM&targetId=${targetId}${dmParam}`).catch(console.error);
      };

      markTabAsRead();
      setUnreadCounts((prev) => ({ ...prev, [activeTab]: 0 }));

      return () => markTabAsRead(); 
    }
  }, [activeTab, targetType, targetId]);

  useEffect(() => {
    setMessages([]);
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const history = await getChatHistory(
          targetType,
          targetId,
          0,
          30,
          activeTab === "GENERAL" ? null : activeTab,
        );
        const uniqueMessages = Array.from(new Map(history.map((msg) => [msg.id, msg])).values());
        uniqueMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(uniqueMessages);
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [targetType, targetId, activeTab]);

  useEffect(() => {
    if (!isConnected || !stompClient) return;

    const subscriptions = [];

    const handleMessage = (message) => {
      const receivedMessage = JSON.parse(message.body);
      const currentTab = activeTabRef.current; 

      if (processedMsgIds.current.has(receivedMessage.id)) return;
      processedMsgIds.current.add(receivedMessage.id);

      if (receivedMessage.senderId !== user.id) {
        const tabForMessage = receivedMessage.recipientId === null ? "GENERAL" : receivedMessage.senderId;

        if (currentTab !== tabForMessage) {
          setUnreadCounts((counts) => ({ ...counts, [tabForMessage]: (counts[tabForMessage] || 0) + 1 }));
        } else {
          const dmParam = currentTab === "GENERAL" ? "" : `&dmPartnerId=${currentTab}`;
          api.post(`/chat/read?targetType=CLASSROOM&targetId=${targetId}${dmParam}`).catch(console.error);
        }
      }

      setMessages((prev) => {
        if (prev.some((msg) => msg.id === receivedMessage.id)) return prev;

        const belongsToGeneral = currentTab === "GENERAL" && receivedMessage.recipientId === null;
        const belongsToDM = currentTab !== "GENERAL" &&
          (receivedMessage.senderId === currentTab || receivedMessage.recipientId === currentTab || receivedMessage.senderId === user.id);

        if (belongsToGeneral || belongsToDM) {
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
          return [...prev, receivedMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }

        return prev;
      });
    };

    const genTopic = targetType === "GENERAL" ? "/topic/general" : `/topic/class/${targetId}`;
    subscriptions.push(stompClient.subscribe(genTopic, handleMessage));

    if (targetType === "CLASSROOM") {
      participants.forEach(p => {
        if (p.id !== user.id) {
          const minId = Math.min(user.id, p.id);
          const maxId = Math.max(user.id, p.id);
          subscriptions.push(stompClient.subscribe(`/topic/class/${targetId}/dm/${minId}_${maxId}`, handleMessage));
        }
      });
    }

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [isConnected, stompClient, targetType, targetId, participants, user.id]);

  const handleSend = (e) => {
    if (e) e.preventDefault(); 
    if (!input.trim() || !isConnected) return;

    const chatMessage = {
      senderId: user.id,
      senderName: user.name,
      content: input.trim(), 
      targetType: targetType,
      targetId: targetId,
      recipientId: activeTab === "GENERAL" ? null : activeTab,
    };

    stompClient.publish({ destination: "/app/chat.sendMessage", body: JSON.stringify(chatMessage) });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      handleSend(e);      
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
      
      {/* LEFT SIDEBAR WITH SMOOTH SLIDE ANIMATION */}
      {targetType === "CLASSROOM" && (
        <div 
          className={`transition-all duration-300 ease-in-out flex flex-col bg-[var(--surface)] overflow-hidden ${
            isSidebarOpen ? "w-[260px] border-r border-[var(--border)] opacity-100" : "w-0 border-none opacity-0"
          }`}
        >
          {/* Inner div maintains fixed width so content doesn't squish during transition */}
          <div className="w-[260px] flex-1 flex flex-col h-full">
            <div className="p-4 border-b border-[var(--border)] font-bold text-[var(--text)]">
              Channels
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              
              <button
                onClick={() => setActiveTab("GENERAL")}
                className={`relative w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === "GENERAL" ? "bg-[var(--primary)] text-white shadow-md" : "text-[var(--text)] hover:bg-[var(--border)]"}`}
              >
                # General Discussion
                {unreadCounts["GENERAL"] > 0 && activeTab !== "GENERAL" && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {unreadCounts["GENERAL"] > 99 ? "99+" : unreadCounts["GENERAL"]}
                  </span>
                )}
              </button>

              <div className="pt-4 pb-1 px-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Direct Messages
              </div>

              {participants
                .filter((p) => {
                  if (p.id === user.id) return false; 
                  const isStudent = user.role === "STUDENT" || user.role === "ROLE_STUDENT";
                  if (isStudent) return p.name.includes("(Teacher)");
                  return true;
                })
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveTab(p.id)}
                    className={`relative w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${activeTab === p.id ? "bg-[var(--primary)] text-white shadow-md" : "text-[var(--text)] hover:bg-[var(--border)]"}`}
                  >
                    <span className="truncate pr-6">{p.name}</span>
                    
                    {unreadCounts[p.id] > 0 && activeTab !== p.id && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        {unreadCounts[p.id] > 99 ? "99+" : unreadCounts[p.id]}
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT CHAT AREA */}
      <div className="flex-1 flex flex-col bg-[var(--background)] min-w-0">
        
        {/* CHAT HEADER WITH TOGGLE BUTTON */}
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm z-10">
          <div className="flex items-center gap-3">
            
            {/* NEW: Sidebar Toggle Button */}
            {targetType === "CLASSROOM" && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-md hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 3v18" />
                </svg>
              </button>
            )}

            <span className="font-bold text-[var(--text)] truncate">
              {activeTab === "GENERAL" ? "General Discussion" : "Private Message"}
            </span>
          </div>

          {!isConnected && (
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600">Reconnecting...</span>
          )}
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[var(--background)]" ref={chatContainerRef}>
          {loading && <div className="text-center text-xs text-[var(--text-muted)]">Loading history...</div>}

          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user.id;
            return (
              <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                  {!isMe && <span className="mb-1 ml-1 text-[10px] font-bold text-[var(--text-muted)]">{msg.senderName}</span>}
                  <div className={`rounded-2xl px-4 py-2 shadow-sm ${isMe ? "bg-[var(--primary)] text-white rounded-tr-sm" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-tl-sm"}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <span className="mt-1 text-[9px] text-[var(--text-muted)]">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BOX */}
        <form onSubmit={handleSend} className="bg-[var(--surface)] p-4 border-t border-[var(--border)]">
          <div className="flex items-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)] transition-all">
            <textarea
              className="flex-1 bg-transparent text-[var(--text)] text-sm outline-none placeholder:text-[var(--text-muted)] resize-none py-1 max-h-32 overflow-y-auto"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={activeTab === "GENERAL" ? "Message #General..." : "Send a direct message..."}
              disabled={!isConnected}
            />
            <button
              type="submit"
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors mb-0.5 ${input.trim() ? "bg-[var(--primary)] text-white hover:bg-blue-600" : "bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed"}`}
              disabled={!isConnected || !input.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}