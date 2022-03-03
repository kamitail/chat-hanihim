import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import GroupMembers from './GroupMembers';
import { RiLogoutBoxLine } from 'react-icons/ri';
import { FcLock, FcUnlock } from 'react-icons/fc';
import '../stylesheets/GroupDetails.css';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function GroupDetails({ show, setShow }) {
    const { chat, leaveChat: leave, lockChat: lockState, updateImage } = useChat();
    const { user, setUser } = useUser();
    const [imageUrl, setImageUrl] = useState('');
    const [groupDesc, setGroupDesc] = useState('');

    useEffect(() => {
        setImageUrl(chat.image);
        setGroupDesc(chat.description);
    }, [chat]);

    const leaveChat = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Once you leave the chat, it will be deleted from your screen",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, leave the chat!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { updatedChat, updatedUser } =
                    await (await
                        axios.patch(`/chats/leave/${chat._id}/${user}`))
                        .data;
                setUser(updatedUser._id);
                leave(updatedChat);
                setShow(false);

                if (updatedChat.members.length === 0) {
                    await axios.delete(`/chats/delete/${updatedChat._id}`);
                }
            }
        });
    };

    const changeLockState = async (lock) => {
        const updatedChat = await (await
            axios.patch(`/chats/lock/${chat._id}/${lock}`))
            .data;
        lockState(updatedChat);
    };

    const lockChat = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Once you lock the chat, only admins can send messages",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, we need to cntrol the people!'
        }).then((result) => {
            if (result.isConfirmed) {
                changeLockState(true);
            }
        });
    };

    const unlockChat = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Once you unlock the chat, all members can send messages",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, we live in a democracy!'
        }).then((result) => {
            if (result.isConfirmed) {
                changeLockState(false);
            }
        });
    };

    const changeChatImage = async (event) => {
        event.preventDefault();

        try {
            if (chat.image !== imageUrl) {
                const newImageChat = await (await
                    axios.put(
                        `/chats/image/${chat._id}`, {
                        image: imageUrl
                    }))
                    .data;
                updateImage(newImageChat);
                Swal.fire({
                    icon: 'success',
                    text: 'You\'ve changed your group\'s image successfuly',
                    timer: 2000,
                    toast: true,
                    position: 'bottom-right'
                });
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const changeChatDesc = async (event) => {
        event.preventDefault();

        try {
            if (chat.description !== groupDesc) {
                const newDescChat = await (await
                    axios.put(
                        `/chats/desc/${chat._id}`, {
                        description: groupDesc
                    }))
                    .data;
                updateImage(newDescChat);
                Swal.fire({
                    icon: 'success',
                    text: 'You\'ve changed the description successfuly',
                    timer: 2000,
                    toast: true,
                    position: 'bottom-right'
                });
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <Modal show={show} fullscreen onHide={() => setShow(false)}>
            {chat.managers && <>
                <Modal.Header
                    closeButton
                    className="details-header d-flex align-items-center">
                    <img
                        src={chat.image}
                        alt="profile logo"
                        className="member-image rounded-circle me-3"
                    />
                    <Modal.Title className="flex-grow-1">
                        {chat.name}<br />
                        <div className="fs-6">
                            Created At: {new Date(chat.created_at).toLocaleDateString('he')}
                        </div>
                    </Modal.Title>
                    {chat.managers.includes(user)
                        && (chat.is_locked
                            ? <FcUnlock
                                className="locked-chat"
                                onClick={() => unlockChat()} />
                            : <FcLock
                                className="locked-chat"
                                onClick={() => lockChat()} />)}
                    <Button
                        variant="link"
                        size="sm"
                        className={`${chat.members.map((member) => member._id).includes(user)
                            ? 'd-block'
                            : 'd-none'}`}
                        onClick={() => leaveChat()}
                    >
                        <RiLogoutBoxLine className="leave-chat" style={{ color: 'red' }} />
                    </Button>
                </Modal.Header>
                <Modal.Body
                    className="d-flex flex-column justify-content-center details-body">
                    <section className="mb-auto d-flex justify-content-center">
                        <Form
                            className="w-75"
                            onSubmit={(event) => changeChatDesc(event)}>
                            <InputGroup>
                                <Form.Control
                                    style={{
                                        'backgroundColor': '#000814',
                                        'borderColor': 'yellowGreen',
                                        'color': 'yellowgreen',
                                    }}
                                    as="textarea"
                                    onInput={(event) => setGroupDesc(event.target.value)}
                                    value={groupDesc}
                                    placeholder="Group Description" />
                                <Button
                                    variant="outline-success"
                                    type="submit">
                                    Change Description
                                </Button>
                            </InputGroup>
                        </Form>
                    </section>
                    <section className="d-flex justify-content-center">
                        <div className="d-flex flex-column me-5 edit-image">
                            <Form
                                onSubmit={(event) => changeChatImage(event)}>
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Add chat image"
                                        value={imageUrl}
                                        className=""
                                        onInput={(event) => setImageUrl(event.target.value)}
                                        style={{
                                            'backgroundColor': '#000814',
                                            'borderColor': 'yellowGreen',
                                            'color': 'yellowgreen',
                                        }}
                                    />
                                    <Button variant="outline-success" type="submit">
                                        Change
                                    </Button>
                                </InputGroup>
                            </Form>
                            <div className="d-flex justify-content-center">
                                <img
                                    src={imageUrl}
                                    alt="profile"
                                    className="chat-edit-image" />
                            </div>
                        </div>
                        <GroupMembers />
                    </section>
                </Modal.Body>
            </>}
        </Modal>
    )
}
