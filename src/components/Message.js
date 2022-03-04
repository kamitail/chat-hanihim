import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
import { FaTrash, FaEye } from 'react-icons/fa';
import '../stylesheets/Message.css';
import { BsCheck2All } from 'react-icons/bs';
import { TiArrowBack } from 'react-icons/ti';
import axios from 'axios';

export default function Message({ message, setRef, lastMessage }) {
    axios.defaults.baseURL = "https://chat-hanihim-server.herokuapp.com";

    const { user } = useUser();
    const { chat, deleteMessage: deleteSelectedMessage, setOriginalMessage } = useChat();

    const messageComplete = chat.members && chat.members.length === message.users_seen.length;
    const chatLock = chat.is_locked && !chat.managers.includes(user);

    const messageHours = new Date(message.sent_at).getHours();
    const messageMinutes = new Date(message.sent_at).getMinutes() / 10 >= 1
        ? new Date(message.sent_at).getMinutes() :
        `0${new Date(message.sent_at).getMinutes()}`;

    const deleteMessage = async (deletedMessage) => {
        try {
            const chatWithoutMessages = await (await
                axios.delete(`https://chat-hanihim-server.herokuapp.com/messages/delete/${deletedMessage._id}`))
                .data;
            deleteSelectedMessage(chatWithoutMessages);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div ref={lastMessage ? setRef : null}
            className={`message mx-4 mt-2 p-2
        ${message.sent_by._id === user
                    ? 'from-me ms-auto'
                    : 'from-others me-auto'}`}>
            <section className="d-flex flex-column">
                <header className="fw-bold fst-italic d-flex align-items-center">
                    {chat.is_group && <div>
                        {message.sent_by._id === user
                            ? 'You'
                            : `~${message.sent_by.firstname} ${message.sent_by.lastname}`}
                    </div>}
                    {chatLock
                        || <TiArrowBack
                            className="return-message-icon ms-auto"
                            onClick={() => setOriginalMessage({
                                sender_id: message.sent_by._id,
                                sender_name:
                                    `${message.sent_by.firstname} ${message.sent_by.lastname}`,
                                content: message.content
                            })} />}
                    {message.sent_by._id === user
                        && <FaTrash
                            className="delete-message-icon"
                            onClick={() => deleteMessage(message)} />}
                    {(message.sent_by._id === user && chat.is_group)
                        && <div class="users-seen">
                            <FaEye className="users-seen-logo" />
                            <div class="tooltiptext d-flex flex-column">
                                {message.users_seen.map((anyUser) => {
                                    const chatMember = chat.members
                                        .find((anyMember) => anyMember._id === anyUser);

                                    return anyUser !== user
                                        ? (
                                            <div>
                                                {`${chatMember.firstname
                                                    } ${chatMember.lastname}`}
                                            </div>
                                        )
                                        : '';
                                })}
                            </div>
                        </div>}
                </header>
                <main className="text-break">
                    {message.original_message
                        && <header className="d-flex flex-column message-with-origin">
                            <div className="fw-bold">
                                {message.original_message.sender_id === user
                                    ? 'You'
                                    : message.original_message.sender_name}
                            </div>
                            {message.original_message.content}
                        </header>}
                    {message.content}
                </main>
                <footer className={`
                align-self-end 
                ${message.sent_by._id === user
                    && 'd-flex align-items-center justify-content-between w-100'}`}>
                    <BsCheck2All
                        className={`
                    ${message.sent_by._id === user
                                ? 'd-block'
                                : 'd-none'} 
                    ${messageComplete
                                ? 'message-checked'
                                : 'message-recieved'}`} />
                    {`${messageHours}:${messageMinutes}`}
                </footer>
            </section>
        </div>
    )
}
