import React from "react";
import { Link } from "react-router-dom";

function NavBar() {
    return (
        <nav className="NavBar">
            <Link to="/"><button>Home</button></Link>
            <Link to="/tasks"><button>Tasks</button></Link>
            <Link to="/notes"><button>Notes</button></Link>
            <Link to="/settings"><button>Settings</button></Link>
        </nav>
    )
}

export default NavBar;
