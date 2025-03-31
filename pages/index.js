import React ,{useState,useEffect,useContext} from 'react'

//internal import
import { ChatAppContext } from "../Context/ChatAppContext";

const ChatApp = () => {
  const { account, userName, error } = useContext(ChatAppContext);
  
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center' 
    }}>
      {account && userName ? (
        <div>
          {/* Empty dashboard with no text */}
        </div>
      ) : account ? (
        <div>
          <h2>Please create an account to continue</h2>
          <p>Click on "Create Account" button in the top-right corner</p>
        </div>
      ) : (
        <div>
          <h2>Welcome to ChatX</h2>
          <p>Please connect your wallet to get started</p>
          <p>Click on "Connect Wallet" button in the top-right corner</p>
        </div>
      )}
    </div>
  )
}

export default ChatApp;