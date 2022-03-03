import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import { ListGroup } from 'react-bootstrap';
import { FaUserTie, FaTrash } from 'react-icons/fa';
import { MdGroupAdd, MdPersonAdd } from 'react-icons/md';
import Swal from 'sweetalert2';
import axios from 'axios';
import AddMembers from './AddMembers';
import UserDetails from './UserDetails';

export const sortMembers = (membersArray) => {
    return membersArray.sort((a, b) => {
        const firstName = `${a.firstname} ${a.lastname}`;
        const secondName = `${b.firstname} ${b.lastname}`;
        return firstName.toLowerCase() > secondName.toLowerCase() ? 1 : -1;
    });
};

export default function GroupMembers() {
    const { chat, kickMember: kick, promoteMember: promote } = useChat();
    const { user } = useUser();
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [memberDetails, setMemberDetails] = useState();

    const showMemberDetails = (member) => {
        axios.get(`/users/id/${member._id}`)
            .then(({ data }) => {
                setMemberDetails(data);
                setShowUserDetails(true);
            })
            .catch((error) => console.log(error.message));
    }

    const kickMember = (member) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are going to kick ${member.firstname} ${member.lastname}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, kick that bastard!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { updatedChat } =
                    await (await
                        axios.patch(
                            `/chats/leave/${chat._id}/${member._id}`))
                        .data;
                kick(updatedChat, member);
            }
        });
    };

    const promoteMember = (member) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are going to promote ${member.firstname} ${member.lastname}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, I trust ${member.firstname} with all my heart!`
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updatedChat =
                    await (await
                        axios.patch(
                            `/chats/promote/${chat._id}/${member._id}`))
                        .data;
                promote(updatedChat);
            }
        });
    };

    return (
        <div>
            <ListGroup className="members-list">
                <ListGroup.Item className="d-flex align-items-center" variant="success">
                    <h1 className="fw-bold flex-grow-1">
                        Group Members List
                    </h1>
                    {chat.managers.includes(user)
                        && <MdPersonAdd
                            className="add-members"
                            onClick={() => setShowAddMembersModal(true)} />}
                </ListGroup.Item>
                <section className="overflow-auto list-scroll">
                    {[chat.members.find((member) => member._id === user),
                    ...sortMembers([...chat.members
                        .filter((member) => member._id !== user
                            && chat.managers.includes(member._id))]),
                    ...sortMembers([...chat.members
                        .filter((member) => member._id !== user
                            && !chat.managers.includes(member._id))])]
                        .map((member, index) => (
                            <ListGroup.Item
                                key={member._id}
                                onClick={() => showMemberDetails(member)}
                                className="fs-4 d-flex member-row align-items-center">
                                <img
                                    src={member.image}
                                    alt="profile logo"
                                    className={`member-image rounded-circle me-3
                                    ${member.is_online
                                            ? 'member-is-online'
                                            : 'member-is-offline'}`} />
                                {chat.managers.includes(member._id)
                                    && <FaUserTie className="admin-logo" />}
                                <div className="flex-grow-1">
                                    {index === 0
                                        ? 'You'
                                        : `${member.firstname} ${member.lastname}`}
                                </div>
                                {(chat.managers.includes(user)
                                    && !chat.managers.includes(member._id))
                                    && <MdGroupAdd
                                        className="add-admin"
                                        onClick={() => promoteMember(member)} />}
                                {(chat.managers.includes(user)
                                    && member._id !== user)
                                    && <FaTrash
                                        className="delete-member"
                                        onClick={() => kickMember(member)} />}
                            </ListGroup.Item>
                        ))}
                </section>
            </ListGroup>
            <AddMembers show={showAddMembersModal} setShow={setShowAddMembersModal} />
            {
                memberDetails
                && <UserDetails
                    show={showUserDetails}
                    setShow={setShowUserDetails}
                    currUser={memberDetails} />
            }
        </div>
    )
}
