import React, { useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import '../stylesheets/SignUpForm.css';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';


export default function LogInForm() {
    const { loginUser } = useUser();

    const emailRef = useRef();
    const passwordRef = useRef();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const logUser =
                await (
                    await axios.post('/users/login',
                        {
                            'email': emailRef.current.value,
                            'password': passwordRef.current.value
                        })
                ).data;
            if (logUser) {
                loginUser(logUser._id);
            } else {
                Swal.fire({
                    icon: 'error',
                    text: 'Email or password not correct',
                    timer: 2000,
                    toast: true,
                    position: 'bottom-right'
                });
            }
        } catch (error) {
            console.log('Problem with connecting to the server');
        }
    };

    return (
        <div
            className="d-flex flex-column align-items-center content-justify-center py-5 page"
            dir="ltr">
            <h1 className="display-4 fw-bold mt-5">Log In</h1>
            <Form
                className="d-flex flex-column mt-3 p-3 sign-form align-items-center"
                onSubmit={handleSubmit}>
                <Form.Group className="w-100">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                        type="email"
                        ref={emailRef} />
                </Form.Group>
                <Form.Group className="w-100">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        ref={passwordRef}
                        aria-describedby="passwordHelpBlock" />
                </Form.Group>
                <Button
                    variant="outline-primary"
                    type="submit"
                    className="mt-5 btn btn-outline-primary">
                    Log In
                </Button>
                <Form.Text className="mt-3" muted>
                    Didn't log in before? <Link to="/signup">Sign Up</Link>
                </Form.Text>
            </Form>
        </div>
    )
}
