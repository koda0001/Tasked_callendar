import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import * as Realm from "realm-web";
import app from '../realm/realmConfig';

function UserDelete() {
    const [user, setUser] = useState(app.currentUser);
    const navigate = useNavigate();

    const DeleteUser = async () => {
        await app.deleteUser(app.currentUser);
        setUser(null);
        navigate('/');
        window.location.reload();
    };

    return (
        <div> 
            <h1>Are you sure you want to delete the account?</h1>
            <button onClick={DeleteUser}>Delete</button>
        </div>

    );

}

export default UserDelete;