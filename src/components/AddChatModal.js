import React, { useState, useEffect, useRef } from 'react';
import { Modal, Badge, Button, Form } from 'react-bootstrap';
import ContactsList from './ContactsList';
import { useUser } from '../contexts/UserContext';
import Swal from 'sweetalert2';
import { useChat } from '../contexts/ChatContext';
import axios from 'axios';

export default function AddChatModal({ show, setShow }) {
    axios.defaults.baseURL = process.env.APP_URL || 'http://192.168.14.63:9000';

    const { user, users } = useUser();
    const [contacts, setContacts] = useState();
    const [members, setMembers] = useState([]);
    const [contactName, setContactName] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const chatNameRef = useRef('');
    const imageRef = useRef('');
    const { chats, chooseChat, refreshChats } = useChat();
    const [imageUrl, setImageUrl] = useState('');

    const searchContacts = () => (
        contacts && contacts.filter((anyContact) => (
            anyContact.firstname.toLowerCase().includes(contactName.toLowerCase())
            || anyContact.lastname.toLowerCase().includes(contactName.toLowerCase())
            || anyContact.email.includes(contactName.toLowerCase())
        ))
    );

    const addMember = (member) => {
        members.length === 1 && setIsGroup(true);
        setMembers([...members, member]);
        setContactName('');
    }

    const removeMember = (member) => {
        if (members.length === 2) {
            setIsGroup(false);
            chatNameRef.current.value = '';
            imageRef.current.value = '';
            setImageUrl('');
        }

        setMembers(members.filter((anyMember) => anyMember !== member));
    }

    useEffect(() => {
        users && setContacts(users.filter((anyUser) =>
            anyUser._id !== user && !members.includes(anyUser)));
    }, [users, user, members]);

    const errorRef = (elemRef, errorMessage) => {
        Swal.fire({
            icon: 'error',
            text: errorMessage,
            timer: 2000,
            toast: true,
            position: 'bottom-right'
        });
        elemRef.current.focus();
    };

    const createChat = async () => {
        try {
            if (isGroup && !chatNameRef.current.value.length) {
                errorRef(chatNameRef, 'Give a name to the chat');
            } else if (members.length) {
                const newChat = {
                    members: [...members, user],
                    created_at: new Date(),
                    is_group: isGroup
                };

                if (isGroup) {
                    newChat.name = chatNameRef.current.value;
                    newChat.created_by = user;
                    newChat.managers = [user];
                    newChat.image = imageRef.current.value.length > 0
                        ? imageRef.current.value
                        : 'https://images.saymedia-content.com/.image/ar_4:3%2Cc_'
                        + 'fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:eco%2Cw_1200/'
                        + 'MTc0NDU4ODYzMDQ5Nzc4ODIy/anime-reviews-k-on-season-two.jpg';
                    newChat.description = '';
                }

                let sameChat;

                if (!isGroup) {
                    sameChat = chats.find((anyChat) => (
                        !anyChat.is_group
                        && anyChat.members.some((anyMember) => anyMember._id === members[0]._id)
                        && anyChat.members.some((anyMember) => anyMember._id === user)
                    ));
                }

                if (sameChat) {
                    chooseChat(sameChat);
                } else {
                    const newSocketChat = await
                        (await axios.post('/chats/add', newChat)).data;
                    refreshChats(newSocketChat);
                }

                setShow(false);
                setMembers([]);
                setIsGroup(false);
                setImageUrl('');
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <div>
            <Modal
                show={show}
                onHide={() => {
                    setShow(false);
                    setMembers([]);
                    setIsGroup(false);
                }}
                backdrop="static"
                keyboard={false}
                className="chat-modal"
            >
                <Modal.Header className="chat-modal-header" closeButton>
                    <Modal.Title>Create new chat</Modal.Title>
                </Modal.Header>
                <Modal.Body className="chat-modal-body">
                    <Form>
                        <Form.Control
                            placeholder="Enter chat's name"
                            className={`mb-3 ${isGroup ? 'd-block' : 'd-none'}`}
                            style={{
                                'backgroundColor': '#000814',
                                'borderTop': '1rem yellowgreen',
                                'borderColor': 'yellowGreen',
                                'borderRadius': '0 0 0.5rem 0.5rem',
                                'color': 'yellowgreen',
                            }}
                            ref={chatNameRef}
                        />
                    </Form>
                    {members.map((member) => (
                        <Badge
                            key={member._id}
                            pill
                            className="
                            chat-modal-badge 
                            d-inline-flex 
                            align-items-center 
                            justify-content-center
                            mx-1"
                            style={{ fontSize: '1rem' }}
                            bg="primary mb-2">
                            <img
                                src={member.image}
                                alt="profile logo"
                                className="user-badge-image me-2 rounded-circle" />
                            {`${member.firstname} ${member.lastname}`}
                            <Button
                                variant="link"
                                style={{
                                    'color': 'white',
                                    'textDecoration': 'none',
                                    'width': '2vw',
                                }}
                                onClick={() => removeMember(member)}>
                                X
                            </Button>
                        </Badge>
                    ))}
                    <Form>
                        <Form.Control
                            placeholder="Search Contacts"
                            onInput={(event) => setContactName(event.target.value)}
                            value={contactName}
                            style={{
                                'backgroundColor': '#000814',
                                'borderTop': '1rem yellowgreen',
                                'borderColor': 'yellowGreen',
                                'borderRadius': '0 0 0.5rem 0.5rem',
                                'margin': '2vh 0 2vh 0',
                                'color': 'yellowgreen',
                            }}
                        />
                    </Form>
                    <ContactsList
                        contacts={searchContacts()}
                        addMember={addMember} />
                    <Form>
                        <Form.Control
                            placeholder="Add chat image"
                            className={`mt-3 ${isGroup ? 'd-block' : 'd-none'}`}
                            onInput={(event) => setImageUrl(event.target.value)}
                            style={{
                                'backgroundColor': '#000814',
                                'borderTop': '1rem yellowgreen',
                                'borderColor': 'yellowGreen',
                                'borderRadius': '0 0 0.5rem 0.5rem',
                                'color': 'yellowgreen',
                            }}
                            ref={imageRef}
                        />
                    </Form>
                    <div className="d-flex justify-content-center">
                        {imageUrl.length > 0
                            && <img
                                src={imageUrl}
                                alt="profile"
                                className="chat-add-image" />}
                    </div>
                </Modal.Body>
                <Modal.Footer className="chat-modal-content">
                    <button
                        className="chat-modal-button"
                        type="button"
                        disabled={members.length === 0}
                        onClick={() => createChat()}
                    >
                        Create Chat
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}
