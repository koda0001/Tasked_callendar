import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import * as Realm from "realm-web";
import app from '../realm/realmConfig';

function UserDetail({ user , onNavClick}) {
    return (
        <nav>
            <h1>Logged in {user.profile.email}</h1>
            <button onClick={() => onNavClick('Home')}>Home</button>
        </nav>
    );
}

// user log in
function RegisterUser({ setUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

const Register = async (e) => {
  e.preventDefault();
  try{
    const credentials = Realm.Credentials.emailPassword(
        username,
        password
      );
    await app.emailPasswordAuth.registerUser({
        email: username,
        password: password,
      });
    const user = await app.logIn(credentials);
    navigate('/');
    window.location.reload();
    setUser(user);
  }catch(error){
    alert(error);
  }
}
return (
    <div>
        <h2>Register new user</h2>
        <form onSubmit={Register}>
        <div>
            <label>Username:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Register</button>
        </form>
    </div>
    );
};

const Register = () => {
const [user, setUser] = useState(app.currentUser);

return (
    <div className="App">
    <div className="App-header">
        {user ? <UserDetail user={user} /> : <RegisterUser setUser={setUser} />}
    </div>
    </div>
);
};

export default Register;
