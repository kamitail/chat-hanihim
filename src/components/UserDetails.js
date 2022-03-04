import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { Modal, Row, Col, Badge, Form, Button } from 'react-bootstrap';
import { FaPen } from 'react-icons/fa';
import { BiSlideshow } from 'react-icons/bi';
import axios from 'axios';
import '../stylesheets/UserDetails.css';
import { useChat } from '../contexts/ChatContext';
import Swal from 'sweetalert2';

export default function UserDetails({ show, setShow, currUser }) {
    axios.defaults.baseURL = "https://chat-hanihim-server.herokuapp.com";

    const { user, setUserDetails } = useUser();
    const [currUserChats, setCurrUserChats] = useState([]);
    const { chooseChat, setShowGroupDetails, editUser: edit } = useChat();
    const [updateUsers, setUpdateUser] = useState(false);
    const [changePassword, setChangePassword] = useState(false);

    const [imageUrl, setImageUrl] = useState();
    const [status, setStatus] = useState();
    const [phoneNumber, setPhoneNumber] = useState();

    const currPasswordRef = useRef();
    const newPasswordRef = useRef();
    const repeatPasswordRef = useRef();

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

    const switchChat = (group) => {
        chooseChat(group);
        setShow(false);
        setShowGroupDetails(false);
    }

    useEffect(() => {
        axios.get(`https://chat-hanihim-server.herokuapp.com/users/chats/${currUser._id}`)
            .then(({ data }) => {
                setCurrUserChats(data.chats);
            })
            .catch((error) => console.log(error.message));
    }, [currUser]);

    const editUser = async (event) => {
        event.preventDefault();

        try {
            if ((phoneNumber && phoneNumber !== currUser.phone_number)
                || (imageUrl && imageUrl !== currUser.image)
                || (status && status !== currUser.status)) {
                const editedUserChats =
                    await (await axios.put('https://chat-hanihim-server.herokuapp.com/users/edit',
                        {
                            'id': user,
                            'phone_number': phoneNumber,
                            'image': imageUrl,
                            status
                        })).data;
                edit(editedUserChats.chats);
                Swal.fire({
                    icon: 'success',
                    text: 'Edit Completed succefuly',
                    timer: 2000,
                    toast: true,
                    position: 'bottom-right'
                });
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const editPassword = async (event) => {
        event.preventDefault();

        const passwordFormat = /^[\w]{6,}$/;

        try {
            if (currPasswordRef.current.value !== currUser.password) {
                errorRef(currPasswordRef, 'Type the correct password');
            } else if (newPasswordRef.current.value === currPasswordRef.current.value) {
                errorRef(newPasswordRef,
                    `New password need to be different from the current one`);
            } else if (!newPasswordRef.current.value.match(passwordFormat)) {
                errorRef(newPasswordRef, 'Password contains only numbers and letters');
            } else if (newPasswordRef.current.value !== repeatPasswordRef.current.value) {
                errorRef(repeatPasswordRef, `The passwords aren't matching`);
            } else {
                const updatedUser = await axios.put('https://chat-hanihim-server.herokuapp.com/users/edit/password',
                    {
                        'id': user,
                        'password': newPasswordRef.current.value
                    }).data;
                setUserDetails(updatedUser);
                Swal.fire({
                    icon: 'success',
                    text: 'Edit Completed succefuly',
                    timer: 2000,
                    toast: true,
                    position: 'bottom-right'
                });
                setChangePassword(false);
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <div>
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header
                    className="user-details-modal d-flex align-items-center"
                    closeButton>
                    <Modal.Title className="flex-grow-1">
                        {`${currUser.firstname} ${currUser.lastname}`}
                    </Modal.Title>
                    {user === currUser._id
                        && <div onClick={() => setUpdateUser(!updateUsers)}>
                            {updateUsers
                                ? <BiSlideshow className="return-user" />
                                : <FaPen className="edit-user" />}
                        </div>}
                </Modal.Header>
                {updateUsers
                    ? <Modal.Body className="fs-5 user-details-modal">
                        <Form onSubmit={(event) => editUser(event)}>
                            <Row>
                                <Form.Control
                                    type="text"
                                    required
                                    placeholder="Image Url"
                                    className="mb-2"
                                    onInput={(event) => setImageUrl(event.target.value)}
                                    value={imageUrl
                                        ? imageUrl
                                        : currUser.image} />
                            </Row>
                            <section className="d-flex align-items-center">
                                <img
                                    src={imageUrl
                                        ? imageUrl
                                        : currUser.image}
                                    alt="profile logo"
                                    className="user-image rounded-circle" />
                                <Form.Control
                                    required
                                    rows={4}
                                    className="ms-3"
                                    as="textarea"
                                    onInput={(event) => setStatus(event.target.value)}
                                    value={status
                                        ? status
                                        : currUser.status} />
                            </section>
                            <Row>
                                <Col sm={5} className="fw-bold">Email</Col>
                                <Col>{currUser.email}</Col>
                            </Row>
                            <Row>
                                <Col sm={5} className="fw-bold">Phone Number</Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        required
                                        placeholder="Phone Number"
                                        onInput={(event) => setPhoneNumber(event.target.value)}
                                        value={phoneNumber
                                            ? phoneNumber
                                            : currUser.phone_number} />
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={5} className="fw-bold">Birthdate</Col>
                                <Col>
                                    {new Date(currUser.birthdate).toLocaleDateString('he')}
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-center mt-2">
                                <Button variant="success" type="submit">
                                    Change Details
                                </Button>
                            </div>
                            <div className="d-flex justify-content-center mt-2">
                                <Button
                                    variant="danger"
                                    type="button"
                                    onClick={() => setChangePassword(true)}>
                                    Edit Password
                                </Button>
                            </div>
                        </Form>
                        <Modal
                            show={changePassword}
                            onHide={() => setChangePassword(false)}
                            className="change-password-modal">
                            <Modal.Header closeButton className="h3">
                                Edit Password
                            </Modal.Header>
                            <Form onSubmit={(event) => editPassword(event)}>
                                <Modal.Body>
                                    <Form.Control
                                        type="password"
                                        required
                                        className="mb-2"
                                        placeholder="Current Password"
                                        ref={currPasswordRef} />
                                    <Form.Control
                                        type="password"
                                        required
                                        className="mb-2"
                                        placeholder="New Password"
                                        ref={newPasswordRef} />
                                    <Form.Control
                                        type="password"
                                        required
                                        placeholder="Repeat Password"
                                        ref={repeatPasswordRef} />
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button type="submit">
                                        Change Password
                                    </Button>
                                </Modal.Footer>
                            </Form>
                        </Modal>
                    </Modal.Body>
                    : <Modal.Body className="fs-5 user-details-modal">
                        <section className="d-flex align-items-center">
                            <img
                                src={currUser.image}
                                alt="profile logo"
                                className="user-image rounded-circle" />
                            <div className="ms-2">{currUser.status}</div>
                        </section>
                        <Row>
                            <Col sm={5} className="fw-bold">Email</Col>
                            <Col>{currUser.email}</Col>
                        </Row>
                        <Row>
                            <Col sm={5} className="fw-bold">Phone Number</Col>
                            <Col>{currUser.phone_number}</Col>
                        </Row>
                        <Row>
                            <Col sm={5} className="fw-bold">Birthdate</Col>
                            <Col>
                                {new Date(currUser.birthdate).toLocaleDateString('he')}
                            </Col>
                        </Row>
                        {user !== currUser._id
                            && <section className="mt-2">
                                <h2>shared groups:</h2>
                                <article className="user-details-chats d-flex">
                                    {currUserChats.filter((anyChat) => (
                                        anyChat.is_group && anyChat.members
                                            .some((anyMember) => anyMember._id === user)
                                    )).map((anyChat) => (
                                        <Badge
                                            key={anyChat._id}
                                            className="
                                        user-details-chats-badge d-flex align-items-center"
                                            bg="success"
                                            pill
                                            onClick={() => switchChat(anyChat)}>
                                            <img
                                                src={anyChat.image}
                                                alt="profile logo"
                                                className="
                                                chat-badge-image
                                                mx-1 
                                                rounded-circle" />
                                            <div>{anyChat.name}</div>
                                        </Badge>
                                    ))}
                                </article>
                            </section>}
                    </Modal.Body>}
            </Modal>
        </div>
    )
}
