import React, { createContext, useContext } from "react";

const VarContext = createContext();

const User = ({ conv }) => {
  const [loadConversation, currentUser, currentReceiver] =
    useContext(VarContext);

  return (
    <div
      className={`p-2 text-center break-all border-b cursor-pointer ${
        currentReceiver == conv.receiver ? "bg-blue-100" : ""
      }`}
      onClick={() => loadConversation(currentUser, conv.receiver)}
    >
      {conv.receiver}
    </div>
  );
};

function Heading({ title }) {
  return <div className="text-xl font-bold text-center p-4">{title}</div>;
}

function Sidebar({
  conversations,
  loadConversation,
  currentUser,
  currentReceiver,
}) {
  return (
    <>
      {/* Sidebar - Conversation List */}
      <VarContext.Provider
        value={[loadConversation, currentUser, currentReceiver]}
      >
        <div className="w-2/3 sm:w-1/3 border-r overflow-y-auto">
          <Heading title="Chat" className="flex justify-center items-center" />
          {/* <h2 className="text-xl font-bold text-center p-4">Conversations</h2> */}
          <div>
            {conversations.length > 0 ? (
              conversations.map((conv, index) => (
                <User key={index} conv={conv} />
              ))
            ) : (
              <p className="text-center py-4">No conversations available.</p>
            )}
          </div>
        </div>
      </VarContext.Provider>
    </>
  );
}

export default Sidebar;
