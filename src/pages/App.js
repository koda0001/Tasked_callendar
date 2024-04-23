// In App.js
import React, { useState } from 'react';
import '../App.css';
import NavBar from '../components/Navbar';
import Home from './Home';
import Notes from './Notes';
import Settings from './Settings';
import Tasks from './Tasks';
import Login from './Login';

function App() {
  const [activeView, setActiveView] = useState('api/Login');

  const handleNavClick = (viewName) => {
    setActiveView(viewName);
  }

  return (
    <div className="App">
      <NavBar onNavClick={handleNavClick} />
      <div className="App-content">
        {activeView === 'Home' && <Home />}
        {activeView === 'Notes' && <Notes />}
        {activeView === 'Tasks' && <Tasks />}
        {activeView === 'Settings' && <Settings />}
        {activeView === 'Login' && <Login />}
      </div>
    </div>
  );
}

export default App;
