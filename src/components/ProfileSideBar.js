import React, { useState, useEffect } from 'react';
import { RiLogoutBoxLine } from 'react-icons/ri';
import { BiCommentAdd } from 'react-icons/bi';
import { Form } from 'react-bootstrap';
import '../stylesheets/ProfileSideBar.css';
import { useChat } from '../contexts/ChatContext';
import { Button } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';
import AddChatModal from './AddChatModal';
import UserDetails from './UserDetails';

export default function ProfileSideBar() {
    const { setSearch,
        setChatIndex,
        chat,
        searchedChats,
        search,
        makeUserOffline } = useChat();
    const { userDetails } = useUser();
    const [showAddChatModal, setShowAddChatModal] = useState(false);
    const [showUserDetails, setShowUserDetails] = useState(false);

    const searchChats = (event) => {
        setSearch(event.target.value);
    }

    useEffect(() => {
        chat && setChatIndex(searchedChats()
            .indexOf(searchedChats().find((anyChat) => anyChat._id === chat._id)));
    }, [search, chat, setChatIndex, searchedChats]);

    return (
        <div className="profile d-flex flex-column">
            <header className="d-flex mt-1 align-items-center justify-content-between">
                <Button
                    variant="link"
                    size="sm"
                    onClick={() => makeUserOffline(userDetails._id)}>
                    <RiLogoutBoxLine className="profile-icon" style={{ color: 'red' }} />
                </Button>
                <Form>
                    <Form.Control
                        placeholder="Search Chat"
                        onInput={(event) => searchChats(event)} />
                </Form>
                <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowAddChatModal(true)}>
                    <BiCommentAdd className="profile-icon" />
                </Button>
            </header>
            <section
                onClick={() => setShowUserDetails(true)}
                className="profile-details">
                <main
                    className="d-flex justify-content-center w-100 mt-1">
                    {userDetails
                        && <img
                            src={userDetails.image}
                            alt="profile logo"
                            className="profile-logo align-self-center rounded-circle" />}
                </main>
                <footer className="d-flex justify-content-center mt-1">
                    <article className="profile-name">
                        {userDetails && `${userDetails.firstname} ${userDetails.lastname}`}
                    </article>
                </footer>
                <footer className="d-flex justify-content-center">
                    <article>{userDetails && userDetails.email}</article>
                </footer>
            </section>
            <AddChatModal show={showAddChatModal} setShow={setShowAddChatModal} />
            {userDetails
                && <UserDetails
                    show={showUserDetails}
                    setShow={setShowUserDetails}
                    currUser={userDetails} />}
        </div>
    )
}
