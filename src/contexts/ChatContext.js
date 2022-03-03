import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useUser } from './UserContext';
import axios from 'axios';
import io from 'socket.io-client';

const ChatContext = React.createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    axios.defaults.baseURL = process.env.APP_URL || 'http://192.168.14.63:9000';

    const [chats, setChats] = useState([]);
    const [chat, setChat] = useState();
    const [search, setSearch] = useState('');
    const { user, users, logoutUser, setUsers, setUserDetails } = useUser();
    const [socket, setScoket] = useState();
    const [chatIndex, setChatIndex] = useState(-1);
    const [newMessages, setNewMessages] = useState();
    const [showGroupDetails, setShowGroupDetails] = useState(false);
    const [originalMessage, setOriginalMessage] = useState();

    useEffect(() => {
        user && axios.put('/users/online', {
            id: user,
            isOnline: true,
            lastSeen: new Date()
        }).then(({ data }) => socket && socket.emit('user-online', {
            chats: data.chats,
            users
        }));
    }, [user, socket, users]);

    window.onbeforeunload = (e) => {
        axios.put('/users/online', {
            id: user,
            isOnline: false,
            lastSeen: new Date()
        });
        socket.emit('user-offline', users);

        return;
    };

    const makeUserOffline = async (userId) => {
        socket && socket.emit('user-offline', users);
        await axios.put('/users/online', {
            id: userId,
            isOnline: false,
            lastSeen: new Date()
        });
        logoutUser();
    };

    useEffect(() => {
        const newSocket = io('https://chat-hanihim-sockets.herokuapp.com', { query: { id: user } });
        setScoket(newSocket);

        return () => newSocket.close();
    }, [user]);

    useEffect(() => {
        user && axios.get(`/users/chats/newMessages/${user}`)
            .then(({ data }) => {
                setNewMessages(data);
            })
            .catch((error) => console.log(error.message));
    }, [user, chat, chats]);

    useEffect(() => {
        user && axios.get(`/users/chats/${user}`)
            .then(({ data }) => {
                setChats(data.chats);
            })
            .catch((error) => console.log(error.message));
    }, [user]);

    const sendMessage = (newChat) => {
        socket.emit('send-message', newChat);
    };

    const checkedMessage = useCallback((newChat) => {
        setChats(chats.map((anyChat) => anyChat._id === newChat._id ? newChat : anyChat));
        (chat && newChat._id === chat._id) && setChat(newChat);
    }, [chats, chat]);

    const addMessage = useCallback(async (newChat) => {
        if (chat && newChat._id === chat._id) {
            const checkedChat = await (await
                axios.patch(`/messages/update/${newChat._id}/${user}`))
                .data;
            socket.emit('check-message', checkedChat);
            setChats([newChat, ...chats.filter((anyChat) => anyChat._id !== newChat._id)]);
            setChat(newChat);
        } else {
            setChats([newChat, ...chats.filter((anyChat) => anyChat._id !== newChat._id)]);
        }
    }, [user, socket, chat, chats]);


    const refreshChats = (newChat) => {
        setChats([newChat, ...chats]);
        setChat(newChat);
        setChatIndex(0);
        setOriginalMessage(null);
        socket.emit('create-chat', newChat);
    };

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('checked-message', checkedMessage);

        return () => socket.off('checked-message');
    }, [socket, checkedMessage]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('created-chat', (newChat) => {
            setChats([newChat, ...chats]);
        });

        return () => socket.off('created-chat');
    }, [socket, chats]);

    const searchedChats = useCallback(() => (
        chats.filter((anyChat) => (
            anyChat.is_group
                ? anyChat.name.toLowerCase().includes(search.toLowerCase())
                : anyChat.members.some((member) => (
                    member._id !== user
                    && (member.firstname.toLowerCase().includes(search.toLowerCase())
                        || member.lastname.toLowerCase().includes(search.toLowerCase()))))
        ))
    ), [chats, search, user]);

    const chooseChat = useCallback(async (checkedChat) => {
        const newChat = await (await
            axios.patch(`/messages/update/${checkedChat._id}/${user}`))
            .data;
        socket.emit('check-message', newChat);
        setChat(newChat);
        setChatIndex(searchedChats().indexOf(checkedChat));
        setOriginalMessage(null);
    }, [user, socket, searchedChats]);

    // useEffect(() => {
    //     chat || (chats[0] && chooseChat(chats[0]));
    // }, [chats, chat, chooseChat]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('recieve-message', addMessage);

        return () => socket.off('recieve-message');
    }, [socket, addMessage]);

    const changeChatInChats = useCallback((newChat) => {
        const newChatIndex = chats
            .indexOf(chats.find((anyChat) => anyChat._id === newChat._id));
        chats[newChatIndex] = newChat;
        newChat._id === chat._id && setChat(newChat);
    }, [chat, chats]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('leaved-chat', (newChat) => {
            changeChatInChats(newChat);
        });

        return () => socket.off('leaved-chat');
    }, [socket, changeChatInChats]);

    const changeMainChat = useCallback((updatedChat) => {
        if (chats[0]._id !== updatedChat._id) {
            setChat(chat[0]);
        } else if (chats[1]) {
            setChat(chats[1]);
        } else {
            setChat(null);
        }
    }, [chat, chats]);

    const leaveChat = (updatedChat) => {
        socket.emit('leave-chat', updatedChat);
        setChats(chats.filter((anyChat) => anyChat._id !== updatedChat._id));
        setChatIndex(0);
        setOriginalMessage(null);
        changeMainChat(updatedChat);
    };

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('kicked-member', (newChat) => {
            if (newChat.members.find((anyMember) => anyMember._id === user)) {
                changeChatInChats(newChat);
            } else {
                setShowGroupDetails(false);
                setChats(chats.filter((anyChat) => anyChat._id !== newChat._id));
                setChatIndex(0);
                setOriginalMessage(null);
                changeMainChat(newChat);
            }
        });

        return () => socket.off('kicked-member');
    }, [socket, changeChatInChats, user, chats, changeMainChat]);

    const kickMember = (updatedChat, kickedMember) => {
        socket.emit('kick-member', { updatedChat, kickedMember });
        changeChatInChats(updatedChat);
    };

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('promoted-member', (newChat) => {
            changeChatInChats(newChat);
        });

        return () => socket.off('promoted-member');
    }, [socket, changeChatInChats]);

    const promoteMember = (updatedChat) => {
        socket.emit('promote-member', updatedChat);
        changeChatInChats(updatedChat);
    };

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('locked-chat', (newChat) => {
            changeChatInChats(newChat);
        });

        return () => socket.off('locked-chat');
    }, [socket, changeChatInChats]);

    const lockChat = (updatedChat) => {
        socket.emit('lock-chat', updatedChat);
        changeChatInChats(updatedChat);
    };

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('added-new-members', (newChat) => {
            setChats([newChat, ...chats]);
            newChat._id === chat._id && setChat(newChat);
        });

        return () => socket.off('added-new-members');
    }, [socket, chats, chat]);

    const addNewMembers = (updatedChat) => {
        socket.emit('add-new-members', updatedChat);
        changeChatInChats(updatedChat);
    };

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('deleted-message', (newChat) => {
            const newChatIndex = chats
                .indexOf(chats.find((anyChat) => anyChat._id === newChat._id));
            const newChats = [...chats];
            newChats[newChatIndex] = newChat;
            setChats(newChats);
            newChat._id === chat._id && setChat(newChat);
        });

        return () => socket.off('deleted-message');
    }, [socket, chat, chats]);

    const deleteMessage = (updatedChat) => {
        socket.emit('delete-message', updatedChat);
        changeChatInChats(updatedChat);
    };

    const changeAndSetChats = useCallback((newChat) => {
        const newChatIndex = chats
            .indexOf(chats.find((anyChat) => anyChat._id === newChat._id));
        const newChats = [...chats];
        newChats[newChatIndex] = newChat;
        setChats(newChats);
        newChat._id === chat._id && setChat(newChat);
    }, [chat, chats]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('image-updated', changeAndSetChats);

        return () => socket.off('image-updated');
    }, [socket, changeAndSetChats]);

    const updateImage = (updatedChat) => {
        socket.emit('update-image', updatedChat);
        changeAndSetChats(updatedChat);
    };

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('edited-user', ({ chats: updatedChats, users: updatedUsers }) => {
            setUsers(updatedUsers);

            const newChats = [...chats];
            updatedChats && updatedChats.forEach((newChat) => {
                const newChatIndex = chats
                    .indexOf(chats.find((anyChat) => anyChat._id === newChat._id));
                newChats[newChatIndex] = newChat;
                (chat && newChat._id === chat._id) && setChat(newChat);
            });
            setChats(newChats);
        });

        return () => socket.off('edited-user');
    }, [socket, chats, chat, setUsers]);

    const editUser = async (editedChats) => {
        const updatedUsers = await (await axios.get('/users')).data;
        const updatedUserDetails = await (await axios.get(`/users/id/${user}`)).data;

        socket.emit('edit-user', { chats: editedChats, users: updatedUsers });

        setUsers(updatedUsers);
        setUserDetails(updatedUserDetails);

        const newChats = [...chats];
        editedChats.forEach((newChat) => {
            const newChatIndex = chats
                .indexOf(chats.find((anyChat) => anyChat._id === newChat._id));
            newChats[newChatIndex] = newChat;
            (chat && newChat._id === chat._id) && setChat(newChat);
        });
        setChats(newChats);
    }

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('user-connected', (updatedChats) => {
            const newChats = [...chats];
            updatedChats.forEach((newChat) => {
                const newChatIndex = chats
                    .indexOf(chats.find((anyChat) => anyChat._id === newChat._id));
                newChats[newChatIndex] = newChat;
                (chat && newChat._id === chat._id) && setChat(newChat);
            });
            setChats(newChats);
        });

        return () => socket.off('user-connected');
    }, [socket, chats, chat]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('user-disconnected', () => {
            user && axios.get(`/users/chats/${user}`)
                .then(({ data }) => {
                    setChats(data.chats);
                    const currChat = data.chats.find((anyChat) => anyChat._id === chat._id);
                    currChat
                        && setChat(currChat);
                })
                .catch((error) => console.log(error.message));
        });

        return () => socket.off('user-disconnected');
    }, [socket, chats, chat, user]);

    return (
        <ChatContext.Provider value={{
            chat,
            chooseChat,
            chats,
            setSearch,
            refreshChats,
            searchedChats,
            search,
            addMessage,
            sendMessage,
            chatIndex,
            setChatIndex,
            newMessages,
            leaveChat,
            kickMember,
            showGroupDetails,
            setShowGroupDetails,
            promoteMember,
            lockChat,
            addNewMembers,
            deleteMessage,
            updateImage,
            makeUserOffline,
            originalMessage,
            setOriginalMessage,
            editUser
        }}>
            {children}
        </ChatContext.Provider>
    );
};
