import React, { useRef, useState } from 'react';
import { Col, Form, Row, Button } from 'react-bootstrap';
import '../stylesheets/SignUpForm.css';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export default function SignUpForm() {
    axios.defaults.baseURL = process.env.APP_URL || 'http://192.168.14.63:9000';

    const { loginUser } = useUser();
    const [imageUrl, setImageUrl] = useState('');

    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const repeatPasswordRef = useRef();
    const phoneNumberRef = useRef();
    const birthDateRef = useRef();
    const imageRef = useRef();

    const errorRef = (elemRef, errorMessage) => {
        Swal.fire({
            icon: 'error',
            text: errorMessage,
            timer: 2000,
            toast: true,
            position: 'bottom-right'
        });
        elemRef.current.focus();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const nameFormat = /^[a-zA-Z]{2,}$/;
        const passwordFormat = /^[\w]{6,}$/;

        let isEmailTaken = undefined;

        try {
            isEmailTaken =
                await (await
                    axios.get(
                        `/users/email/${emailRef.current.value}`)).data;
        } catch (error) {
            console.log('There is a problem in connecting to the server');
        }

        if (!firstNameRef.current.value.match(nameFormat)) {
            errorRef(firstNameRef, 'Name contains only letters');
        } else if (!lastNameRef.current.value.match(nameFormat)) {
            errorRef(lastNameRef, 'Name contains only letters');
        } else if (isEmailTaken) {
            errorRef(emailRef, 'Email is already in use');
        } else if (!passwordRef.current.value.match(passwordFormat)) {
            errorRef(passwordRef, 'Password contains only numbers and letters');
        } else if (passwordRef.current.value !== repeatPasswordRef.current.value) {
            errorRef(repeatPasswordRef, `The passwords aren't matching`);
        } else {
            try {
                const newUserDetails = {
                    'firstname': firstNameRef.current.value,
                    'lastname': lastNameRef.current.value,
                    'email': emailRef.current.value,
                    'phone_number': phoneNumberRef.current.value,
                    'birthdate': birthDateRef.current.value,
                    'password': passwordRef.current.value,
                    'is_online': true,
                    'last_seen': new Date()
                };

                if (imageRef.current.value.length > 0) {
                    newUserDetails.image = imageRef.current.value;
                }

                const newUser =
                    await (await axios.post('/users/add', newUserDetails)).data;
                loginUser(newUser._id);
            } catch (error) {
                console.log(error.message);
            }
        }
    };

    return (
        <div
            className="d-flex flex-column align-items-center content-justify-center page"
            dir="ltr">
            <h1 className="display-4 fw-bold">Sign Up</h1>
            <Form
                className="d-flex flex-column mt-1 p-3 sign-form align-items-center"
                onSubmit={handleSubmit}>
                <Row>
                    <Col>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                required
                                placeholder="First Name"
                                className="mt-1"
                                ref={firstNameRef} />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                required
                                className="mt-1"
                                placeholder="Last Name"
                                ref={lastNameRef} />
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Group className="w-100">
                    <Form.Control
                        type="email"
                        required
                        className="mt-2"
                        placeholder="Email Address"
                        ref={emailRef} />
                </Form.Group>
                <Form.Group className="w-100">
                    <Form.Control
                        type="password"
                        ref={passwordRef}
                        className="mt-2"
                        placeholder="Password"
                        aria-describedby="passwordHelpBlock"
                        required />
                    <Form.Text id="passwordHelpBlock" muted>
                        Your password must be at least 6 characters long,
                        and only contain letters and numbers
                    </Form.Text>
                </Form.Group>
                <Form.Group className="w-100">
                    <Form.Control
                        type="password"
                        required
                        className="mt-2"
                        placeholder="Repeat Password"
                        ref={repeatPasswordRef} />
                </Form.Group>
                <Form.Group className="w-100">
                    <Form.Control
                        type="number"
                        required
                        className="mt-2"
                        placeholder="Phone Number"
                        ref={phoneNumberRef} />
                </Form.Group>
                <Form.Group className="w-100">
                    <Form.Control
                        type="date"
                        required
                        className="mt-2"
                        placeholder="Birth Date"
                        ref={birthDateRef} />
                </Form.Group>
                <Form.Group className="w-100">
                    <Form.Control
                        type="text"
                        className="mt-2"
                        onInput={(event) => setImageUrl(event.target.value)}
                        placeholder="Profile Image"
                        ref={imageRef} />
                </Form.Group>
                {imageUrl.length > 0
                    && <img
                        src={imageUrl}
                        alt="profile"
                        className="sign-profile-image" />}
                <Button
                    variant="outline-primary"
                    type="submit"
                    className="mt-2 btn btn-outline-primary">
                    Sign Up
                </Button>
                <Form.Text className="mt-1" muted>
                    Already created an account? <Link to="/login">Log In</Link>
                </Form.Text>
            </Form>
        </div>
    )
}
