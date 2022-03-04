import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import '../stylesheets/ChatHeader.css';
import { sortMembers } from './GroupMembers';
import GroupDetails from './GroupDetails';
import UserDetails from './UserDetails';
import axios from 'axios';

export default function ChatHeader() {
    axios.defaults.baseURL = "https://chat-hanihim-server.herokuapp.com";

    const { chat, showGroupDetails, setShowGroupDetails } = useChat();
    const [memberDetails, setMemberDetails] = useState();
    const [lastSeen, setLastSeen] = useState();
    const { user } = useUser();
    const [cardStyle, setCardStyle] = useState({
        'backgroundColor': 'springgreen',
        'color': '#003566'
    });
    const [showUserDetails, setShowUserDetails] = useState(false);

    useEffect(() => {
        if (memberDetails) {
            const lastSeenHours = new Date(memberDetails.last_seen).getHours();
            const lastSeenMinutes = new Date(memberDetails.last_seen).getMinutes() / 10 >= 1
                ? new Date(memberDetails.last_seen).getMinutes() :
                `0${new Date(memberDetails.last_seen).getMinutes()}`;

            setLastSeen(new Date(memberDetails.last_seen).toLocaleDateString('he')
                === new Date().toLocaleDateString('he')
                ? `${lastSeenHours}:${lastSeenMinutes}`
                : `${new Date(memberDetails.last_seen).toLocaleDateString('he')
                }, ${lastSeenHours}:${lastSeenMinutes}`);
        }
    }, [memberDetails]);

    useEffect(() => {
        (!chat.is_group && user)
            && axios.get(`https://chat-hanihim-server.herokuapp.com/users/id/${chat.members
                .find((anyMember) => anyMember._id !== user)._id}`)
                .then(({ data }) => {
                    setMemberDetails(data);
                })
                .catch((error) => console.log(error.message));
    }, [user, chat]);

    const chatMembers = [...sortMembers([...chat.members
        .filter((anyMember) => anyMember._id !== user)])]
        .map((member) => (
            `${member.firstname} ${member.lastname}`
        )).join(', ');

    const headerContent = chatMembers.length > 114
        ? chatMembers.substring(0, 114) + '...'
        : chatMembers;

    return (
        <>
            <div
                style={cardStyle}
                onMouseOver={() => setCardStyle({
                    'backgroundColor': 'yellowgreen',
                    'color': '#003566',
                    'cursor': 'pointer'
                })}
                onMouseLeave={() => setCardStyle({
                    'backgroundColor': 'springgreen',
                    'color': '#003566',
                    'cursor': 'pointer'
                })}
                onClick={() => chat.is_group
                    ? setShowGroupDetails(true)
                    : setShowUserDetails(true)}
                className="chat-header d-flex align-items-center">
                <section>
                    <img
                        alt="logo"
                        className="chat-header-logo rounded-circle"
                        src={chat.is_group
                            ? chat.image
                            : memberDetails && memberDetails.image
                        } />
                </section>
                <section className="ms-3">
                    <div className="fw-bold fs-4">
                        {chat.is_group
                            ? chat.name
                            : chat.members && `${chat.members
                                .find((member) => member._id !== user).firstname}
                                ${chat.members
                                .find((member) => member._id !== user).lastname}`}
                    </div>
                    <div>
                        {chat.is_group
                            ? headerContent.length
                                ? headerContent
                                : 'No one in this group except you'
                            : memberDetails
                                ? memberDetails.is_online
                                    ? 'Online'
                                    : `Last time seen: ${lastSeen}`
                                : ''}
                    </div>
                </section>
            </div>
            <GroupDetails show={showGroupDetails} setShow={setShowGroupDetails} />
            {
                memberDetails
                && <UserDetails
                    show={showUserDetails}
                    setShow={setShowUserDetails}
                    currUser={memberDetails} />
            }
        </>
    )
}
