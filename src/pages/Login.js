import { useContext, useEffect, useState } from "react";
import * as Realm from "realm-web";
import { APP_ID } from "../realm/constants";
import "../css/Home.css";

const app = new Realm.App({ id: APP_ID });

// Create a component that displays the given user's details
function UserDetail({ user }) {
    const logoutanonymus = async () => {
        await app.currentUser.logOut();
    }

    return (
      <div>
        <h1>Logged in with anonymous id: {user.id}</h1>
        <button onClick={logoutanonymus}>Log out</button>
      </div>
    );
}

// Create a component that lets an anonymous user log in
function LoginUser({ setUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
const Login = async (e) => {
    e.preventDefault();  // Prevent the form from submitting traditionally
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


// function LoginUserEmail({ setUser }) {
//         const [username, setUsername] = useState('');
//         const [password, setPassword] = useState('');
//     const handleSubmit = async () => {
//         try{
//             const credentials = Realm.Credentials.emailPassword(
//                 "wiktor.waclaw@dave-it.pl",
//                 "123qwe"
//                 // { username },
//                 // { password }
//               );
//             console.log(credentials)
            
//             const user = await app.logIn(credentials);
//             setUser(user);

//         }catch (error) {
//             alert(error);
//           }
//     };

    // return (
    //     <div>
    //         <h2>Login</h2>
    //         <form onSubmit={handleSubmit}>
    //         <div>
    //             <label>Username:</label>
    //             <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
    //         </div>
    //         <div>
    //             <label>Password:</label>
    //             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
    //         </div>
    //         <button type="submit">Login</button>
    //         </form>
    //     </div>
    //     );
    // };


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
    




// const Login = () => {
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
  
//     const handleSubmit = async (event) => {
//       event.preventDefault();
  
//       const requestOptions = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password })
//       };
  
//       try {
//         const response = await fetch('http://localhost:3002/api/login', requestOptions);
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const message = await response.text();
//         alert(message);  // Display a success message or handle further navigation
//       } catch (error) {
//         alert('Login failed: ' + error.message);
//       }
//     };
  

// return (
//     <div>
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Username:</label>
//           <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
//         </div>
//         <div>
//           <label>Password:</label>
//           <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//         </div>
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// };

// export default Login;