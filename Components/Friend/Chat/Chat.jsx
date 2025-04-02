import React,{useState,useEffect, useActionState} from 'react'
import Image from 'next/image'
import Style from "./Chat.module.css"
import { useRouter } from 'next/router'
import images from "../../../assets"
import { convertTime } from '@/Utils/apiFeature'
import { Loader } from '@/Components/index1'

const Chat = ({functionName,readMessage,friendMsg,account,userName,loading,currentUserName,currentUserAddress}) => {

  const [message,setMessage] =useState('');
  const [chatData,setChatData]=useState({
    name:"",
    address:"",
  })
  const router=useRouter()

  useEffect(()=>{
    if(!router.isReady) return
    setChatData(router.query);

  },[router.isReady]);
  console.log(chatData.address,chatData.name);

  return (
    <div></div>
  )
}

export default Chat