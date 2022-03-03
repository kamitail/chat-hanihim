import React from 'react';
import LogInForm from '../components/LogInForm';
import PageLogo from '../components/PageLogo';

export default function LogIn() {

    return (
        <div className="d-flex" dir="rtl">
            <PageLogo />
            <LogInForm />
        </div>
    )
}
