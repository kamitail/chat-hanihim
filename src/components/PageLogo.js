import React from 'react';
import logo from '../images/logo.png';
import '../stylesheets/PageLogo.css';

export default function PageLogo() {
    return (
        <div className="d-flex justify-content-end">
            <img src={logo} alt="Logo" className="logo" />
        </div>
    )
}
