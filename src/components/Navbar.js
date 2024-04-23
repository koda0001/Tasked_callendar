import React from "react";

function NavBar({ onNavClick }) {
    return (
        <nav className="NavBar">
            <button onClick={() => onNavClick('Home')}>Home</button>
            <button onClick={() => onNavClick('Tasks')}>Tasks</button>
            <button onClick={() => onNavClick('Notes')}>Notes</button>
            <button onClick={() => onNavClick('Settings')}>Settings</button>
            <button onClick={() => onNavClick('Login')}>Login</button>
        </nav>
    )
}

export default NavBar;