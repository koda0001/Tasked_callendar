import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './Home';
import Notes from './Notes';
import Tasks from './Tasks';
import Settings from './Settings';
import "../App.css"; // You can define your styles for the modal here


function App() {
  return (
    <Router>
      <div className="Container">
        <nav>
          <Link to="/">Home</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/tasks">Tasks</Link>
          <Link to="/settings">Settings</Link>
        </nav>
        <div className="Home">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
