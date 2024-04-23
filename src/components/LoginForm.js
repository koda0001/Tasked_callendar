import { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; // Make sure to import only what is needed
import * as Realm from "realm-web";
import { APP_ID } from "../realm/constants";

const app = new Realm.App({ id: APP_ID });

// Displays the given user's details
function UserDetail({ user }) {
    const logout = async () => {
        await app.currentUser.logOut();
    }

    return (
        <div>
            <h1>Logged in {user.profile.email}</h1>
            <button onClick={logout}>Log out</button>
        </div>
    );
}

// user log in
function LoginUser({ setUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Get the history object here

const Login = async (e) => {
  e.preventDefault();
  try{
    const credentials = Realm.Credentials.emailPassword(
        username,
        password
      );
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
        <h2>Login</h2>
        <form onSubmit={Login}>
        <div>
            <label>Username:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
        </form>
    </div>
    );
};

const Login = () => {
// Keep the logged in Realm user in local state. This lets the app re-render
// whenever the current user changes (e.g. logs in or logs out).
const [user, setUser] = useState(app.currentUser);

// If a user is logged in, show their details.
// Otherwise, show the login screen.
return (
    <div className="App">
    <div className="App-header">
        {user ? <UserDetail user={user} /> : <LoginUser setUser={setUser} />}
    </div>
    </div>
);
};

export default Login;