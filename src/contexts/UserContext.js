import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

const UserContext = React.createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    axios.defaults.baseURL = process.env.APP_URL || 'http://192.168.14.63:9000';

    const [user, setUser] = useState(localStorage.getItem('ut'));
    const [users, setUsers] = useState([]);
    const [userDetails, setUserDetails] = useState();
    const history = useHistory();

    useEffect(() => {
        axios.get(`/users`)
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
        user && axios.get(`/users/id/${user}`)
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
