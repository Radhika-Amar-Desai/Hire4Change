import React from "react";
import { MdSend } from "react-icons/md";

function Message({ msg, currentUser }) {
  return (
    <>
      <div
        className={`mb-4 w-fit p-3 rounded-2xl ${
          msg.sender == currentUser
            ? "bg-blue-500 text-white self-end ml-auto"
            : "bg-gray-200 text-black"
        }`}
        style={{ textAlign: "center", wordWrap: "break-all" }}
      >
        {msg.contentType === "image" ? (
          <img
            src={`data:image/png;base64,${msg.content}`}
            alt="image-message"
            className="rounded-lg"
            style={{ maxWidth: "100%" }}
          />
        ) : (
          <p>{msg.content}</p>
        )}
      </div>
      <br />
    </>
  );
}

function MessageInput({ messageInput, setMessageInput, sendMessage }) {
  return (
    <div className="p-2 md:p-8 flex items-center bg-white border-t border-gray-200">
      <div className="border w-full flex py-2 px-4 rounded-2xl">
        <input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="w-full flex-grow p-2 rounded-lg focus:outline-none"
        />
        <button onClick={() => sendMessage()}>
          <MdSend className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

function MainContent({
  messages,
  messageInput,
  currentUser,
  setMessageInput,
  sendMessage,
}) {
  return (
    <div className="w-full flex flex-col">
      <div className="flex-grow overflow-y-auto p-4 bg-gray-100">
        {messages && messages.length > 0 ? (
          messages.map((msg, index) => (
            <Message msg={msg} currentUser={currentUser} />
          ))
        ) : (
          <p className="text-center py-4">No messages in this conversation.</p>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        sendMessage={sendMessage}
      />
    </div>
  );
}

export default MainContent;
