import React from 'react';
import Chat from '../components/Chat';
import SideBar from '../components/SideBar';
import { ChatProvider } from '../contexts/ChatContext';
import '../stylesheets/Home.css';

export default function Home() {
    return (
        <div className="d-flex home">
            <ChatProvider>
                <SideBar />
                <Chat />
            </ChatProvider>
        </div>
    )
}
