import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/chatSidebar/Sidebar.jsx";
import MainContent from "../components/chatMainContent/MainContent.jsx";
import API_ENDPOINTS from "../config/apiConfig.js";

const POLLING_INTERVAL = 5000;

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [currentReceiver, setCurrentReceiver] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); // Get location to access passed state

  useEffect(() => {
    const user = location.state?.userId || localStorage.getItem("username");
    const receiver = location.state?.receiver;

    if (!user) {
      alert("No user specified. Redirecting to login page.");
      navigate("/login");
    } else {
      setCurrentUser(user);
      fetchConversations(user);
    }

    if (receiver) {
      setCurrentReceiver(receiver);
    }
  }, [location, navigate]);

  // Fetch the conversations for the user
  const fetchConversations = async (username) => {
    try {
      const response = await fetch(API_ENDPOINTS.get_all_messages, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      setConversations(data.conversations);

      // Check if conversation with the receiver exists and load messages if it does
      if (location.state?.receiver) {
        const conversationExists = data.conversations.some(
          (conv) => conv.receiver === location.state.receiver
        );
        if (!conversationExists) {
          // Create a new conversation if it doesn't exist
          sendMessage();
        } else {
          loadConversation(username, location.state.receiver);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Load the messages for a selected conversation
  const loadConversation = async (sender, receiver) => {
    setCurrentReceiver(receiver);
    try {
      const response = await fetch(API_ENDPOINTS.get_conversation, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, receiver }),
      });
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Send a new message (text or image)
  const sendMessage = async (content = null, contentType = "text") => {
    if (!currentReceiver) {
      return;
    }
    if (!content) content = messageInput.trim();
    if (content) {
      try {
        await fetch(API_ENDPOINTS.message, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: currentUser,
            receiver: currentReceiver,
            content,
            contentType,
            timestamp: new Date().toISOString(),
          }),
        });
        if (contentType === "text") setMessageInput("");
        // Fetch the conversation again to refresh messages
        loadConversation(currentUser, currentReceiver);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const base64Image = e.target.result.split(",")[1];
        sendMessage(base64Image, "image");
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (currentUser && currentReceiver) {
      const intervalId = setInterval(() => {
        loadConversation(currentUser, currentReceiver);
      }, POLLING_INTERVAL);

      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [currentUser, currentReceiver]);

  console.log(currentUser);
  console.log(currentReceiver);

  return (
    <div className="flex m-[4vw] w-full rounded-2xl border-[1px] border-zinc-300 mx-auto bg-white shadow-lg h-[80vh] m-[2vw]">
      <Sidebar
        conversations={conversations}
        loadConversation={loadConversation}
        currentUser={currentUser}
        currentReceiver={currentReceiver}
      />

      <MainContent
        currentUser={currentUser}
        messages={messages}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        sendMessage={sendMessage}
      />
    </div>
  );
};

export default Messages;
