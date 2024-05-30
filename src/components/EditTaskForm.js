import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import app from '../realm/realmConfig';

function EditTask({ task }) {
    const navigate = useNavigate();
    const date = format(new Date(), 'yyyy-MM-dd');
    const [isEditing, setIsEditing] = useState(false);
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorEvents, setErrorEvents] = useState(null);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const userId = app.currentUser?.id;


    
    
    
    
    const [currentTask, setCurrentTask] = useState({
        date: date,
        title: task.title,
        content: task.content,
        status: task.status, // Default status
        linkedEvent: task.linkedEvent // Initialize linkedEvent as null
    });
    console.log('selected task is:', currentTask);


    const UpdateTasks = async (e) => {
        e.preventDefault();
        console.log('tasks data', currentTask);
        const tasksid = currentTask._id;
        const userid = app.currentUser.id;
        const bodyData = {
          userid: userid,
          date: currentTask.date,
          title: currentTask.title,
          content: currentTask.content,
          status: currentTask.status,
          linkedEvent: currentTask.linkedEvent // Include linkedEvent in the request body
        };
    
        try {
          const response = await fetch(`http://localhost:3002/api/updatetask'}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': userid,
              'taskid': tasksid
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
          const fetchUpdatedTasks = async () => {
            try {
              const response = await fetch(`http://localhost:3002/api/tasks?userId=${userId}`, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `${userId}`
                }
              });
              if (!response.ok) {
                throw new Error('Something went wrong!');
              }
              const data = await response.json();
              const formattedTasks = data.map(task => ({
                ...task,
                date: new Date(task.date)
              }));
              setTasks(formattedTasks);
            } catch (error) {
              console.error("Failed to fetch tasks:", error);
              setError(error.toString());
            } finally {
              setIsLoading(false);
            }
          };
          fetchUpdatedTasks();
        } catch (error) {
          console.error("Failed to save tasks:", error);
        }
    };

    const fetchEvents = async () => {
        if (!userId) {
          setErrorEvents('Please log in to see events');
          return;
        }
        setIsLoadingEvents(true);
        try {
          const response = await fetch(`http://localhost:3002/api/events?userId=${userId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `${userId}`
            }
          });
          if (!response.ok) {
            throw new Error('Something went wrong!'); // Handling non-2xx responses
          }
          const data = await response.json();
          setEvents(data);
          setErrorEvents(null);
        } catch (error) {
          console.error("Failed to fetch events:", error);
          setErrorEvents(error.toString());
        } finally {
          setIsLoadingEvents(false);
        }
      };

    const handleOpenModal = (task = { date: date, title: '', content: '', status: 'In progress' }) => {
        setCurrentTask(task);
        setIsEditing(!!task.title);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTask({ date: date, title: '', content: '', status: 'In progress', linkedEvent: null });
    };

    return (
        <div className="app">
          <div className="tasks-grid">
            {tasks.map((task, index) => (
              <div key={index} className="task" onClick={() => handleOpenModal(task)}>
                {task.title}
              </div>
            ))}
          </div>
            <h2>{'Edit Task'}</h2>
            <form onSubmit={UpdateTasks}>
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
              <select
                  value={currentTask.linkedEvent}
                  onChange={(e) => setCurrentTask({ ...currentTask, linkedEvent: e.target.value })}
                >
                  <option value="">Select an event...</option>
                  {events.map(event => (
                    <option key={event._id} value={event._id}>
                      {event.title}
                    </option>
                  ))}
                </select>
                <button type="submit">Save Task</button>
                <button type="button" onClick={handleCloseModal}>Cancel</button>
              </form>
          </div>
        );
  
}

export default EditTask;
