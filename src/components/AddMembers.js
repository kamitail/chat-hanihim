import React, { useState, useEffect } from 'react';
import { Modal, Form, Badge, Button } from 'react-bootstrap';
import { useChat } from '../contexts/ChatContext';
import ContactsList from './ContactsList';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';

export default function AddMembers({ show, setShow }) {
    axios.defaults.baseURL = "https://chat-hanihim-server.herokuapp.com";

    const [members, setMembers] = useState([]);
    const [contacts, setContacts] = useState();
    const [contactName, setContactName] = useState('');
    const { chat, addNewMembers: add } = useChat();
    const { user, users } = useUser();

    const addMember = (member) => {
        setMembers([...members, member]);
        setContactName('');
    }

    const removeMember = (member) => {
        setMembers(members.filter((anyMember) =>
            anyMember !== member
            && !chat.members.some((chatMember) => chatMember._id === anyMember._id)));
    }

    useEffect(() => {
        setContacts(users.filter((anyUser) =>
            anyUser._id !== user
            && !members.includes(anyUser)
            && !chat.members.some((chatMember) => chatMember._id === anyUser._id)));
    }, [users, user, members, chat]);

    const searchContacts = () => (
        contacts && contacts.filter((anyContact) => (
            anyContact.firstname.toLowerCase().includes(contactName.toLowerCase())
            || anyContact.lastname.toLowerCase().includes(contactName.toLowerCase())
            || anyContact.email.includes(contactName.toLowerCase())
        ))
    );

    const addNewMembers = async () => {
        try {
            const newMembersChat = await (await
                axios.put(`/chats/users/add/${chat._id}`,
                    { members })).data;
            add(newMembersChat);
            setShow(false);
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
                }}
                backdrop="static"
                keyboard={false}
                className="chat-modal"
            >
                <Modal.Header className="chat-modal-header" closeButton>
                    <Modal.Title>Add new members</Modal.Title>
                </Modal.Header>
                <Modal.Body className="chat-modal-content">
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
                </Modal.Body>
                <Modal.Footer className="chat-modal-content">
                    <button
                        className="chat-modal-button"
                        type="button"
                        disabled={members.length === 0}
                        onClick={() => addNewMembers()}
                    >
                        Add Members
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}
