import React, { useRef } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import '../stylesheets/ChatInput.css';
import axios from 'axios';
import { FaLock, FaTimes } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';

export default function ChatInput() {
    axios.defaults.baseURL = "https://chat-hanihim-server.herokuapp.com";

    const messageRef = useRef();
    const { user } = useUser();
    const { chat,
        sendMessage: sendSocketMessage,
        addMessage,
        originalMessage,
        setOriginalMessage } = useChat();

    const chatLock = chat.is_locked && !chat.managers.includes(user);

    const sendMessage = async (event) => {
        event.preventDefault();

        try {
            if (messageRef.current.value.length) {
                const sendedMessage = {
                    'content': messageRef.current.value,
                    'users_seen': [user],
                    'sent_at': new Date(),
                    'sent_by': user,
                    chat
                };

                if (originalMessage) {
                    sendedMessage.original_message = originalMessage;
                    setOriginalMessage(null);
                }

                const newChat =
                    await (await
                        axios.post('/messages/add', sendedMessage)).data;
                messageRef.current.value = '';
                sendSocketMessage(newChat);
                addMessage(newChat);
            }
        } catch (error) {
            console.log(error.message);
        }
    }
    return (
        <div className="chat-input d-flex align-items-center">
            {originalMessage && <section className="original-message">
                <header className="d-flex align-items-center">
                    <div className="fw-bold">
                        {originalMessage.sender_id === user
                            ? 'You'
                            : originalMessage.sender_name}
                    </div>
                    <FaTimes
                        className="ms-auto cancel-original-message"
                        onClick={() => setOriginalMessage(null)} />
                </header>
                {originalMessage.content}
            </section>}
            <Form className="chat-form" onSubmit={sendMessage}>
                <Form.Group>
                    <InputGroup>
                        <Form.Control
                            placeholder="Type here"
                            ref={messageRef}
                            disabled={chatLock}
                        />
                        <Button
                            disabled={chatLock}
                            type="submit"
                            variant="outline-success"
                            className="d-flex align-items-center justify-content-center">
                            {chatLock
                                ? <FaLock />
                                : 'Send'}
                        </Button>
                    </InputGroup>

                </Form.Group>
            </Form>
        </div>
    )
}
