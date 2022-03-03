import React from 'react';
import ChatHeader from './ChatHeader';
import { useChat } from '../contexts/ChatContext';
import '../stylesheets/Chat.css';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

export default function Chat() {
    const { chat } = useChat();

    return (
        <div className="chat">
            {chat
                ? <>
                    <ChatHeader />
                    <ChatMessages />
                    <ChatInput />
                </>
                : <div className="no-chat d-flex align-items-center justify-content-center">
                    Pick a chat
                </div>}
        </div>
    )
}
