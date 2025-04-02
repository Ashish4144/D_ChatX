import React ,{useState,useEffect, Children} from 'react'
import { useRouter } from 'next/router'

//internal import
import { CheckIfWalletConnected,connectWallet,connectingWithContract } from '@/Utils/apiFeature';

export const ChatAppContext=React.createContext();

export const ChatAppProvider=({children})=>{
    const[account,setAccount] = useState("");
    const[userName,setUserName]=useState("");
    const[friendLists,setFriendLists]=useState([]);
    const[friendMsg,setFriendMsg]=useState([]);
    const[loading,setLoading]=useState(false);
    const[userLists,setUserLists]=useState([]);
    const[error,setError]=useState("");

    //chat user data
    const[currentUserName,setCurrentUserName]=useState("");
    const[currentUserAddress,setCurrentUserAddress]=useState("");

    const router=useRouter();

    //fetch data time of page load
    const fetchData=async()=>{
        try {
            if (!window.ethereum) {
                setError("Please Install and Connect Your Wallet");
                return;
            }
            
            //get account
            const connectAccount=await connectWallet();
            if (!connectAccount) {
                setError("Please connect your wallet");
                return;
            }
            setAccount(connectAccount);
            
            //get contract
            const contract=await connectingWithContract();
            if (!contract) {
                setError("Error connecting to contract");
                return;
            }
            
            try {
                //get username
                const userName = await contract.getUsername(connectAccount);
                if (userName) {
                    setUserName(userName);
                }
            } catch (nameError) {
                console.log("No username found - user hasn't created account yet");
            }
            
            try {
                //get all app user list
                const userList = await contract.getAllAppUsers();
                if (userList) {
                    setUserLists(userList);
                }
            } catch (error) {
                console.log("Error fetching user list:", error);
                setUserLists([]);
            }
            
            try {
                //get my friend list
                const friendLists = await contract.getMyFriendList();
                if (friendLists) {
                    setFriendLists(friendLists);
                }
            } catch (error) {
                console.log("Error fetching friend list:", error);
                setFriendLists([]);
            }
            
        } catch (error) {
            console.error("Fetch data error:", error);
            setError("Please Install and Connect Your Wallet");
        }
    };
    
    useEffect(()=>{
        fetchData();
    },[]);
    
    //read message
    const readMessage=async(friendAddress)=>{
        try {
            const contract=await connectingWithContract();
            const read =await contract.readMessage(friendAddress);
            setFriendMsg(read);
        } catch (error) {
            setError("Currently You have no Message")
        }
    }
    
    // create account
    const createAccount=async ({name,accountAddress})=>{
        try {
            if (!name || name.trim() === "") {
                setError("Name cannot be empty");
                return;
            }

            setLoading(true);
            const contract=await connectingWithContract();
            const getCreatedUser=await contract.createAccount(name);
            await getCreatedUser.wait();
            
            // Set the username immediately
            setUserName(name);
            
            // Update the user list
            try {
                const userList = await contract.getAllAppUsers();
                if (userList) {
                    setUserLists(userList);
                }
            } catch (listError) {
                console.log("Error fetching updated user list:", listError);
            }
            
            setLoading(false);
            setError("");
            
            // Close any open dialogs by dispatching a custom event
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('accountCreated'));
            }
        } catch (error) {
            console.error("Create account error:", error);
            if (error.message && error.message.includes("User already exists")) {
                setError("This wallet address already has an account");
            } else {
                setError("Error while creating your account. Please try again.");
            }
            setLoading(false);
        }
    }

    //add your friend
    const addFriends=async({name,accountAddress})=>{
        try {
            // if(name||accountAddress) return setError("Please provide name and account address");
            const contract=await connectingWithContract();
            const addMyFriend=await contract.addFriend(accountAddress,name);
            setLoading(true);
            await addMyFriend.wait();
            setLoading(false);
            router.push("/");
            window.location.reload();

        } catch (error) {
            setError("Something went wrong while adding friends,try again");
        }
    }
  //send message to you friend
  const sendMessage=async({msg,address})=>{
    try {
        if(msg||address) return setError("Please type your message");

        const contract=await connectingWithContract();
        const addMessage=await contract.sendMessage(address,msg);
        setLoading(true);
        await addMessage.wait();
        setLoading(false);
        window.location.reload();

    } catch (error) {
      setError("Please reload and try again");  
    }
  }
  //read info
  const readUser=async(userAddress)=>{
    const contract=await connectingWithContract();
    const userName=await contract.getUsername(userAddress);
    setCurrentUserName(userName);
    setCurrentUserAddress(userAddress);
  }
    return(
        
        <ChatAppContext.Provider value ={{ readMessage,createAccount,addFriends,sendMessage,readUser,connectWallet,account,
            CheckIfWalletConnected,
            userName,
            friendLists,
            friendMsg,
            loading,userLists,error,currentUserAddress,currentUserName,

        }}>
            {children}
        </ChatAppContext.Provider>
    )

}