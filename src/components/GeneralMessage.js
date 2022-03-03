import React from 'react';
import '../stylesheets/GeneralMessage.css';

export default function GeneralMessage({ content }) {
    return (
        <div
            className="general-message d-flex align-self-center justify-content-center py-1 px-2 my-2">
            <div>{content}</div>
        </div>
    )
}
