import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

const UserContext = React.createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    axios.defaults.baseURL = "https://chat-hanihim-server.herokuapp.com";

    const [user, setUser] = useState(localStorage.getItem('ut'));
    const [users, setUsers] = useState([]);
    const [userDetails, setUserDetails] = useState();
    const history = useHistory();

    useEffect(() => {
        axios.get(`https://chat-hanihim-server.herokuapp.com/users`)
            .then(({ data }) => {
                setUsers(data);
            })
            .catch((error) => console.log(error.message));
    }, []);

    useEffect(() => {
        localStorage.setItem('ut', user);

        if (user && user !== 'null' && user.length) {
            history.push('/');
        } else {
            history.push('/login');
        }
    }, [user, history]);

    const loginUser = (logedUser) => {
        setUser(logedUser);
    };

    const logoutUser = () => {
        setUser('');
    };

    useEffect(() => {
        user && axios.get(`https://chat-hanihim-server.herokuapp.com/users/id/${user}`)
            .then(({ data }) => {
                setUserDetails(data);
            })
            .catch((error) => console.log(error.message));
    }, [user]);

    return (
        <UserContext.Provider value={{
            user,
            loginUser,
            logoutUser,
            userDetails,
            users,
            setUser,
            setUsers,
            setUserDetails
        }}>
            {children}
        </UserContext.Provider>
    );
};
