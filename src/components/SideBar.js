import React from 'react';
import '../stylesheets/SideBar.css';
import ChatTab from './ChatTab';
import { useChat } from '../contexts/ChatContext';
import ProfileSideBar from './ProfileSideBar';

export default function SideBar() {
    const { newMessages, searchedChats, chats } = useChat();
    
    return (
        <div className="sidebar">
            <ProfileSideBar />
            <section className="sidebar-chats">
                {searchedChats().map((anyChat, index) => (
                    <ChatTab
                        key={anyChat._id}
                        chat={anyChat}
                        index={index}
                        newMessages={newMessages && newMessages[chats.indexOf(anyChat)]}
                    />
                ))}
            </section>
        </div>
    )
}
