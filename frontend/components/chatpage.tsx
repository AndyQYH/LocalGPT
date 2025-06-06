/**
* This code was generated by v0 by Vercel.
* @see https://v0.dev/t/IeBt3KbMHdr
* Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
*/

/** Add fonts into your Next.js project:

import { IBM_Plex_Sans } from 'next/font/google'
import { Rubik } from 'next/font/google'

ibm_plex_sans({
  subsets: ['latin'],
  display: 'swap',
})

rubik({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
"use client";
import React, { useEffect, useState, useRef, FormEvent } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import SignOutForm from './ui/signout-button';
import { fetchConversationsByUser, fetchMessagesByConversation } from '@/lib/utils'; 
import ChatTab from './ui/chat-tab';
import { Session } from "next-auth";
import { Conversation } from '@/lib/definitions';
import ParameterTuningMenu from "@/components/ui/params-menu";
import {v4 as uuidv4} from 'uuid';



// Define types for the response message and WebSocket ref
interface ResponseMessage {
  sender: string;
  message: string;
  id?: string; // id is optional
}

function emptyMessage():ResponseMessage{
  return{
    sender: '',
    message: '',
    id: undefined, // id is optional
  }
}

interface CustomSession extends Session {
  user: {
    name?: string;
    email: string;
    image?: string;
    // Add any other custom properties here
    id: string; // Example of a custom property
    role?: string; // Example of another custom property
  };
}

export const getUserInfo = async (user:any) => {
  //console.log(session)
  
  const userId = user?.id!
  const conversations = await fetchConversationsByUser(userId);
  console.log("user Id:")
  console.log(userId)
  const conversationId = conversations[0]?.id;
  console.log("conv Id:")
  console.log(conversationId)
  const messages = await fetchMessagesByConversation(conversationId);
  console.log("messages:")
  console.log(messages)
  
};

export function Chatpage({user}:Session){
  console.log("user in chat: \n", user)
  const [input, setInput] = useState<string>('');
  // State to store the responses/messages
  const [responses, setResponses] = useState<ResponseMessage[]>([]);
  const [newResponses, setnewResponses] = useState<ResponseMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [docReferences, setDocReferences] = useState<any[]>([]);
  const [parameters, setParameters] = useState({
    temperature: 0.7,
    maxTokens: 500,
    topK: 50,
    topP: 1,
    lengthPenalty: 1,
    repetitionPenalty: 1,
  });
  const socket_id = useRef<string | null>(null);

  const handleParameterChange = (newParams : any) => {
    setParameters(newParams);
  };

  // Ref to manage the WebSocket connection
  const ws = useRef<WebSocket | null>(null);
  // Ref to scroll to the latest message
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // Maximum number of attempts to reconnect
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const maxReconnectAttempts = 5;
  
  // Function to setup the WebSocket connection and define event handlers
  const setupWebSocket = () => {
    if(!socket_id.current)
      socket_id.current = uuidv4();

    ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/${socket_id.current}`);
    let ongoingStream: { id: string; content: string } | null = null; // To track the ongoing stream's ID

    ws.current.onopen = () => {
      console.log("WebSocket connected!");
      setReconnectAttempts(0); // Reset reconnect attempts on successful connection
    };

    ws.current.onmessage = (event) => {
      try {
        // Try parsing the incoming message as JSON.
        const data = JSON.parse(event.data);
        if (data.type && data.type === "doc_info") {
          // Update document references state
          setDocReferences(data.documents);
          return;
        }
      } catch (e) {
        // If parsing fails, treat the message as plain text.
      }
      
      // Process as answer text (existing logic)
      const chunk = event.data;
      if (chunk === "[DONE]") {
        console.log("Stream complete.");
        return;
      }
      setResponses((prev) => {
        if (prev.length === 0 || prev[prev.length - 1].sender !== 'bot') {
          return [...prev, { sender: 'bot', message: chunk }];
        } else {
          const updated = [...prev];
          updated[updated.length - 1].message += chunk;
          return updated;
        }
      });
    };

    ws.current.onerror = (event) => {
      console.error("WebSocket error observed:", event);
    };

    ws.current.onclose = (event) => {
      console.log(`WebSocket is closed now. Code: ${event.code}, Reason: ${event.reason}`);
      handleReconnect();
    };
  };

  // Function to handle reconnection attempts with exponential backoff
  const handleReconnect = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      let timeout = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff
      setTimeout(() => {
        setupWebSocket(); // Attempt to reconnect
      }, timeout);
    } else {
      console.log("Max reconnect attempts reached, not attempting further reconnects.");
    }
  };

  // Effect hook to setup and cleanup the WebSocket connection
  useEffect(() => {
    setupWebSocket(); // Setup WebSocket on component mount

    const getUserMsgs = async ()=>{
      const userId = user?.id!
      const convos = await fetchConversationsByUser(userId);
      setConversations(convos)
      console.log("user Id:")
      console.log(userId)
      console.log("conversation:")
      console.log(convos)
    }

    getUserMsgs().catch(console.error)

    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close(); // Close WebSocket on component unmount
      }
    };
  }, []);

  // Effect hook to auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses]);

  useEffect(() => {
    console.log("new response:")
    console.log(newResponses)
  }, [newResponses]);

  // Function to render each message
  const renderMessage = (response: ResponseMessage, index: number) => (
    <div key={index} className="flex items-start gap-4">
      <Avatar className="w-8 h-8 border">
        <AvatarImage src={response.sender === 'user' ? '/placeholder-user.jpg' : '/placeholder-bot.png'} />
        <AvatarFallback>{response.sender === 'user' ? 'You' : 'Assistant'}</AvatarFallback>
      </Avatar>
      <div className="grid gap-1">
        <div className="font-bold">{response.sender === 'user' ? 'You' : 'Azure Local AI'}</div>
        <div className="prose text-muted-foreground whitespace-pre-wrap">
          <p>{response.message}</p>
        </div>
         {docReferences.length > 0 && (
          <div className="p-4 border-t">
            <h4 className="font-bold mb-2">Documents used:</h4>
            <ul>
              {docReferences.map((doc, index) => (
                <li key={index}>
                  {doc.title || doc.source || "Unknown Document"}
                  {/* You can include additional details if available */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  // Handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Handler for form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const userMessage: ResponseMessage = { sender: "user", message: input };
    setResponses(prevResponses => [...prevResponses, userMessage]);
    setnewResponses(prevResponses => [...prevResponses, userMessage]);
    
    // Include both the user's message and the current model parameters.
    const payload = {
      message: input,
      params: parameters,
    };
    
    ws.current?.send(JSON.stringify(payload));
    setInput('');
  };


  return (
    <div className="flex h-screen w-full flex-row bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-full flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex-1 space-y-4 overflow-y-auto">
            <div className="flex items-start gap-4">
              <Avatar className="w-8 h-8 border">
                <AvatarImage src="/placeholder-bot.png" />
                <AvatarFallback>OA</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-bold">Azure Local AI</div>
                <div className="prose text-muted-foreground">
                  <p>
                    Hello there! Welcome to Azure Local AI Playground! Feel free to ask any questions!
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto">
              {responses.map((response, index) => renderMessage(response, index))}
              <div ref={messagesEndRef} /> {/* Invisible element to help scroll into view */}
            </div>
          </div>

          {/* user text input and submission */}
          <div className="mt-4 flex items-center gap-2">
            <Textarea
              placeholder="Type your message here..."
              className="flex-1 rounded-2xl border border-neutral-400 p-2 shadow-sm resize-none"
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
            <Button onClick={handleSubmit} type="submit" size="icon" className="rounded-full bg-primary text-primary-foreground">
              <SendIcon className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          
        </div>
      </div>
      
      <div className="flex flex-col border-l bg-muted p-4">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <Input
              type="search"
              placeholder="Search conversations..."
              className="hidden md:block rounded-lg bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            <Button variant="ghost" size="sm" className="hidden md:flex bg-black text-white items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              <span>Start New</span>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </Button>
          </div>
        </div>
        <div className="mt-4 flex-2 overflow-y-auto md:block hidden">
          <div className="space-y-2">
            {conversations.map(convo=>{
              return(
                <ChatTab {...convo}/>
              )
            })}
          </div>
        </div>
        <Separator className="my-4 md:block hidden" />
        <div className="mt-4 flex-1 overflow-y-auto md:block hidden">
          <div className="space-y-2">
            <div className="flex items-center justify-center rounded-md px-3 py-2 hover:bg-background">
              <div className="font-medium">Settings</div>
            </div>
            {/* Parameter Tuning Menu */}
            <ParameterTuningMenu onParamsChange={handleParameterChange} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Avatar className="w-8 h-8 border">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>YO</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <div className="font-medium">{user?.name || "John Doe"}</div>
            <div className="text-xs text-muted-foreground">{user?.email || "johndoe@example.com"}</div>
          </div>
          <SignOutForm/>
        </div>
        
      </div>
      <div className="relative h-4 cursor-col-resize border-l border-r border-muted-foreground/10">
        <div className="absolute inset-0 flex items-center justify-center">
          <GripVerticalIcon className="h-4 w-4 text-muted-foreground/50" />
        </div>
      </div>
    </div>
  )
}

function GripVerticalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  )
}


function MoveHorizontalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 8 22 12 18 16" />
      <polyline points="6 8 2 12 6 16" />
      <line x1="2" x2="22" y1="12" y2="12" />
    </svg>
  )
}


function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}


function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}


function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
