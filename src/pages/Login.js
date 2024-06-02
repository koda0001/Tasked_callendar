import { useContext, useEffect, useState } from "react";
import * as Realm from "realm-web";
import { APP_ID } from "../realm/constants";
import "../css/Home.css";

const app = new Realm.App({ id: APP_ID });

function UserDetail({ user }) {
    const logout = async () => {
        await app.currentUser.logOut();
    }

    return (
      <div>
        <h1>Logged in with anonymous id: {user.id}</h1>
        <button onClick={logout}>Log out</button>
      </div>
    );
}

function LoginUser({ setUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
const Login = async (e) => {
    e.preventDefault();
    try{
        const credentials = Realm.Credentials.emailPassword(
            username,
            password
          );
        const user = await app.logIn(credentials);
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
const [user, setUser] = useState(app.currentUser);
return (
    <div className="App">
    <div className="App-header">
        {user ? <UserDetail user={user} /> : <LoginUser setUser={setUser} />}
    </div>
    </div>
);
};

export default Login;