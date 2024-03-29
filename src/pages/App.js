// In App.js
import React, { useState } from 'react';
import '../App.css';
import NavBar from '../components/Navbar';
import Home from './Home'; // Ensure this import is correct
import Notes from './Notes';
import Settings from './Settings';
import Tasks from './Tasks';

function App() {
  const [activeView, setActiveView] = useState('Home');
  const [data] = 0;

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
      </div>
      <h1>Welcome!!</h1>
    </div>
  );
}

export default App;
