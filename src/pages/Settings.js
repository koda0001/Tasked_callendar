import React, { useState } from 'react';
import Modal from '../components/Modal';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import DeleteAccountForm from '../components/DeleteAccountForm';
import app from '../realm/realmConfig';

function Login() {
    const [user, setUser] = useState(app.currentUser);
    const [showModal, setShowModal] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    const openModal = (login = true) => {
        setIsLogin(login);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleLogout = async () => {
        await app.currentUser.logOut();
        setUser(null);
    };

    if (user) {
        return (
            <div className="user-settings">
                <h1>Welcome, {user.profile.email || "User"}!</h1>
                <button onClick={handleLogout}>Log out</button>
                <button onClick={() => openModal(true)}>Delete account</button>
                <Modal isOpen={showModal} close={closeModal}>
                    <DeleteAccountForm setUser={setUser} close={closeModal} />
                </Modal>
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
