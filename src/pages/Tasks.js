import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import app from '../realm/realmConfig';
import { format } from 'date-fns';
import '../css/Tasks.css';

function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const date = format(new Date(), 'yyyy-MM-dd');
  const userId = app.currentUser?.id;
  const [currentTask, setCurrentTask] = useState({
    date: date,
    title: '',
    content: '',
    status: 'In progress', // Default status
  });

  useEffect(() => {
    const fetchNotes = async () => {
      if (!userId) {
        setError('Please log in to see tasks');
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3002/api/tasks?userId=${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${userId}`
          }
        });
        if (!response.ok) {
          throw new Error('Something went wrong!'); // Handling non-2xx responses
        }
        const data = await response.json();
        console.log("Connected correctly to server");

        const formattedNotes = data.map(event => ({
          ...event,
          date: new Date(event.date) // Ensuring date is converted to Date object
        }));

        setTasks(formattedNotes);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setError(error.toString());
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [userId]);

  const createOrUpdateTasks = async (e) => {
    e.preventDefault();
    console.log('tasks data', currentTask);
    const tasksid = currentTask._id;
    const userid = app.currentUser.id;
    const bodyData = {
      userid: userid,
      date: currentTask.date,
      title: currentTask.title,
      content: currentTask.content,
      status: currentTask.status, // Add status to the request body
    };

    try {
      const response = await fetch(`http://localhost:3002/api/${isEditing ? 'updatetask' : 'addtask'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userid,
          'taskid': tasksid // Correctly set the task ID header
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      console.log("Connected correctly to server");
      handleCloseModal();
      setIsLoading(true);
      setError(null);
      const fetchUpdatedNotes = async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/tasks?userId=${userId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `${userId}`
            }
          });
          if (!response.ok) {
            throw new Error('Something went wrong!'); // Handling non-2xx responses
          }
          const data = await response.json();
          const formattedTasks = data.map(tasks => ({
            ...tasks,
            date: new Date(tasks.date) // Ensuring date is converted to Date object
          }));
          setTasks(formattedTasks);
        } catch (error) {
          console.error("Failed to fetch tasks:", error);
          setError(error.toString());
        } finally {
          setIsLoading(false);
        }
      };
      fetchUpdatedNotes();
    } catch (error) {
      console.error("Failed to save tasks:", error);
    }
  };

  const handleOpenModal = (task = { date: date, title: '', content: '', status: 'In progress' }) => {
    setCurrentTask(task);
    setIsEditing(!!task.title);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTask({ date: date, title: '', content: '', status: 'In progress' });
  };

  return (
    <div className="app">
      <button onClick={() => handleOpenModal()}>Add Task</button>
      <div className="tasks-grid">
        {tasks.map((task, index) => (
          <div key={index} className="task" onClick={() => handleOpenModal(task)}>
            {task.title}
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} close={handleCloseModal} onRequestClose={handleCloseModal} contentLabel="Task Modal">
        <h2>{isEditing ? 'Edit Task' : 'Add Task'}</h2>
        <form onSubmit={createOrUpdateTasks}>
          <input
            type="text"
            value={currentTask.title}
            maxLength="20"
            placeholder="Title (max 20 characters)"
            onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
          />
          <textarea
            value={currentTask.content}
            placeholder="Task text"
            onChange={(e) => setCurrentTask({ ...currentTask, content: e.target.value })}
          />
          <select
            value={currentTask.status}
            onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
          >
            <option value="In progress">In progress</option>
            <option value="On hold">On hold</option>
            <option value="Done">Done</option>
            <option value="Canceled">Canceled</option>
          </select>
          <button type="submit">Save Task</button>
          <button type="button" onClick={handleCloseModal}>Cancel</button>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
