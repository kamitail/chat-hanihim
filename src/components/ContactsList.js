import React from 'react';
import { ListGroup } from 'react-bootstrap';

export default function ContactsList({ contacts, addMember }) {
    return (
        <div>
            <ListGroup className="overflow-auto contacts-list">
                {contacts && contacts.map((contact, index) => {
                    return (
                        <ListGroup.Item
                            key={contact._id}
                            variant={index % 2 === 0 ? 'secondary' : 'light'}
                            role="button"
                            onClick={() => addMember(contact)}
                            className={`d-flex align-items-center fs-3 pe-auto text-dark
                            ${index % 2 === 0
                                    ? 'contact-item-even'
                                    : 'contact-item-odd'}`}>
                            <img
                                src={contact.image}
                                alt="profile logo"
                                className="profile-logo align-self-center rounded-circle me-3"
                            />
                            <section className="d-flex flex-column">
                                <div>
                                    {`${contact.firstname} ${contact.lastname}`}
                                </div>
                                <div className="fs-6">
                                    {contact.email}
                                </div>
                            </section>
                        </ListGroup.Item>
                    )
                })}
            </ListGroup>
        </div>
    )
}
