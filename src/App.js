import React, { useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState(['Task 1', 'Task 2']);
  const [newTask, setNewTask] = useState('');
  const [name, setName] = useState('Wiktor');

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, newTask]);
    setNewTask('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Manager</h1>
        <div>
          <div id="Text1">
            <p>Hello {name}</p>
          </div>

        
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task"
          />
          <button onClick={addTask}>Add Task</button>
        </div>
        <ul>
          {tasks.map((task, index) => (
            <li key={index}>{task}</li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
