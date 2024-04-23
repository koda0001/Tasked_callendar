import React, { useState } from 'react';
import Modal from './Modal';
import LoginForm from './LoginForm'; // Assuming this holds the form logic shown previously
import RegisterForm from './RegisterForm'; // You need to create this component similarly to LoginForm
import app from '../realm/realmConfig';  // Ensure this path points to where your `app` instance is created


function Login() {
    const [user, setUser] = useState(app.currentUser);
    const [showModal, setShowModal] = useState(false);
    const [isLogin, setIsLogin] = useState(true); // true for login form, false for register form

    const openModal = (login = true) => {
        setIsLogin(login);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    if (user) {
        return (
            <div className="user-settings">
                <h1>Welcome, {user.profile.email}!</h1>
                <button onClick={() => user.logOut()}>Log out</button>
            </div>
        );
    }

    return (
        <div className="App">
            <div className="App-header">
                <button onClick={() => openModal(true)}>Login</button>
                <button onClick={() => openModal(false)}>Register</button>
                <Modal isOpen={showModal} close={closeModal}>
                    {isLogin ? <LoginForm setUser={setUser} close={closeModal} /> : <RegisterForm close={closeModal} />}
                </Modal>
            </div>
        </div>
    );
}

export default Login;
