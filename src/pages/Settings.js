import React, { useState } from 'react';
import Modal from '../components/Modal';
import LoginForm from '../components/LoginForm'; // Ensure this component handles the login logic
import RegisterForm from '../components/RegisterForm'; // Ensure this component handles the registration logic
import app from '../realm/realmConfig';  // Ensure this is correctly imported

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

    const handleLogout = async () => {
        await app.currentUser.logOut();
        setUser(null); // Update state after logout
    };

    // Show user settings and logout if logged in
    if (user) {
        return (
            <div className="user-settings">
                <h1>Welcome, {user.profile.email || "User"}!</h1>
                <button onClick={handleLogout}>Log out</button>
            </div>
        );
    }

    // Show login and registration options if not logged in
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
