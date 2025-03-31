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

    // Set the user name with local storage for persistence
    const updateUserName = (name) => {
        setUserName(name);
        if (name) {
            localStorage.setItem('chatx_username', name);
        }
    };

    //fetch data time of page load
    const fetchData=async()=>{
        try {
            // Check if ethereum is available first
            if (!window.ethereum) {
                console.log("Please install MetaMask");
                return;
            }

            //get contract
            const contract=await connectingWithContract();
            //get account
            const connectAccount=await connectWallet();
            
            // Only proceed if we have an account
            if(connectAccount) {
                setAccount(connectAccount);
                
                // First check local storage
                const storedName = localStorage.getItem('chatx_username');
                if (storedName) {
                    setUserName(storedName);
                } else {
                    //get username from contract
                    const userName = await contract.getUsername(connectAccount);
                    if (userName) {
                        updateUserName(userName);
                    }
                }
                
                //get my friend list
                const friendLists=await contract.getMyFriendList();
                setFriendLists(friendLists);
                //get all app user list
                const userList=await contract.getAllAppUser();
                setUserLists(userList);
            }
            
        } catch (error) {
            console.log("Error in fetchData:", error);
            // Only set error if it's not related to a missing wallet connection
            if (error.message && !error.message.includes("user rejected") && !error.message.includes("User denied")) {
                setError("Please Install and Connect Your Wallet");
            }
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
            // if (name || accountAddress)
            //     return setError("Name and AccountAddress,cannot be empty");

            const contract=await connectingWithContract();
            const getCreatedUser=await contract.createAccount(name);
            setLoading(true);
            await getCreatedUser.wait();
            setLoading(false);
            updateUserName(name);
            window.location.reload();
        } catch (error) {
            setError("Error while creating your account.Please reload browser")
        }
    }

    //add your friend
    const addFriends=async({name,accountAddress})=>{
        try {
            if(name||accountAddress) return setError("Please provide name and account address");
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
            loading,userLists,error,currentUserAddress,currentUserName,

        }}>
            {children}
        </ChatAppContext.Provider>
    )

}
