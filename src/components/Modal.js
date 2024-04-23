import React from 'react';
import "../css/Modal.css"; // You can define your styles for the modal here

function Modal({ children, isOpen, close }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={close}>X</button>
                {children}
            </div>
        </div>
    );
}

export default Modal;
