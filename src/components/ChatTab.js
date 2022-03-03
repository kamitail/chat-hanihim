import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import '../stylesheets/ChatTab.css';
import { useChat } from '../contexts/ChatContext';

export default function ChatTab({ chat, index, newMessages }) {
    const { user } = useUser();
    const { chooseChat, chat: selectedChat, chatIndex } = useChat();
    const activeClass = {
        'backgroundColor': '#001D3D',
        'color': 'springgreen',
        'cursor': 'pointer'
    };
    const regularClass = {
        'backgroundColor': '#003566',
        'color': 'springgreen',
        'cursor': 'pointer'
    };
    const [cardStyle, setCardStyle] = useState({});

    useEffect(() => {
        index === chatIndex
            ? setCardStyle({
                'backgroundColor': '#001D3D',
                'color': 'springgreen',
                'cursor': 'pointer'
            })
            : setCardStyle({
                'backgroundColor': '#003566',
                'color': 'springgreen',
                'cursor': 'pointer'
            });
    }, [selectedChat, chatIndex, index, chat]);

    let chatHeadline = chat.is_group
        ? chat.name
        : `${chat.members
            .find((member) => member._id !== user).firstname
        } ${chat.members.find((member) => member._id !== user).lastname}`;

    if (chatHeadline.length > 14) {
        chatHeadline = chatHeadline.substring(0, 12) + '...';
    }

    const lastMessageIndex = chat.messages.length - 1;
    let messageContent = '';
    let messageTime = '';

    if (chat.messages[lastMessageIndex]) {
        if (chat.messages[lastMessageIndex].sent_by._id === user) {
            messageContent += `You: ${chat.messages[lastMessageIndex].content}`;
        } else {
            messageContent +=
                `${chat.messages[lastMessageIndex].sent_by.firstname
                }: ${chat.messages[lastMessageIndex].content}`;
        }

        if (messageContent.length > 17) {
            messageContent = messageContent.substring(0, 18) + '...';
        }

        const lastMessageHours =
            new Date(chat.messages[lastMessageIndex].sent_at).getHours();
        const lastMessageMinutes =
            new Date(chat.messages[lastMessageIndex].sent_at).getMinutes() / 10 >= 1
                ? new Date(chat.messages[lastMessageIndex].sent_at).getMinutes() :
                `0${new Date(chat.messages[lastMessageIndex].sent_at).getMinutes()}`;

        messageTime =
            new Date(chat.messages[lastMessageIndex].sent_at).toLocaleDateString('he')
                === new Date().toLocaleDateString('he')
                ? `${lastMessageHours}:${lastMessageMinutes}`
                : new Date(chat.messages[lastMessageIndex].sent_at).toLocaleDateString('he');
    }

    return (
        <div className="chat d-flex align-items-center"
            style={cardStyle}
            onMouseOver={() => setCardStyle(activeClass)}
            onMouseLeave={() => index !== chatIndex && setCardStyle(regularClass)}
            onClick={() => { chooseChat(chat); }}>
            <section>
                <img
                    className="chat-logo rounded-circle"
                    alt="logo"
                    src={chat && chat.is_group
                        ? chat.image
                        : chat.members
                            .find((member) => member._id !== user).image} />
                <div className="text-center last-message-time">
                    {messageTime}
                </div>
            </section>
            <section className="flex-grow-1 ms-2">
                <h4>
                    {chatHeadline}
                </h4>
                <div>
                    {chat.messages[lastMessageIndex]
                        ? messageContent
                        : <div className="fst-italic text-muted">
                            No Messages Yet
                        </div>}
                </div>
            </section>
            {newMessages !== 0 &&
                <section
                    className=
                    "new-messages align-self-center rounded-circle \
                        d-flex align-items-center justify-content-center">
                    {newMessages}
                </section>}
        </div>
    )
}
