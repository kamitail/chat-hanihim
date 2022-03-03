import React, { useCallback } from 'react';
import '../stylesheets/ChatMessages.css';
import { useChat } from '../contexts/ChatContext';
import Message from './Message';
import { useUser } from '../contexts/UserContext';
import GeneralMessage from './GeneralMessage';

export default function ChatMessages() {
    const { chat } = useChat();
    const { user } = useUser();

    const setRef = useCallback((node) => {
        if (node) {
            node.scrollIntoView({ smooth: true });
        }
    }, []);

    return (
        <div className="chat-messages overflow-auto d-flex flex-column px-1">
            {chat.messages && chat.messages.map((message, index) => {
                const lastMessage = chat.messages.length - 1 === index;

                const days =
                    ['Sunday', 'Monday', 'Tuesday',
                        'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const messageDate = new Date(message.sent_at).getDate();
                const messageMonth = new Date(message.sent_at).getMonth();
                const messageYear = new Date(message.sent_at).getFullYear();
                const messageDay = new Date(message.sent_at).getDay();
                const generalMessageContent =
                    (messageYear === new Date().getFullYear()
                        && messageMonth === new Date().getMonth()
                        && messageDate === new Date().getDate())
                        ? 'Today'
                        : `${days[messageDay]}, ${messageDate
                        }/${messageMonth + 1}/${messageYear}`;
                const isDifferentDay = index !== 0 &&
                    (messageDate !== new Date(chat.messages[index - 1].sent_at).getDate()
                        || messageMonth !== new Date(chat.messages[index - 1].sent_at).getMonth()
                        || messageYear
                        !== new Date(chat.messages[index - 1].sent_at).getFullYear());

                return (
                    <div
                        className="d-flex flex-column w-100"
                        key={message._id}>
                        {(index === 0 || isDifferentDay)
                            && <GeneralMessage
                                content={generalMessageContent} />}
                        <Message
                            setRef={setRef}
                            lastMessage={lastMessage}
                            message={message}
                            className={`
                    ${message.sent_by._id === user
                                    ? 'align-self-end'
                                    : 'align-self-start'}
                `} />
                    </div>
                )
            })}
        </div>
    )
}
