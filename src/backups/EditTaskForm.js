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

    const updateTasks = async (e) => {
        e.preventDefault();
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
            const response = await fetch(`http://localhost:3002/api/updatetask`, {
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
            fetchTasks(); // Refetch tasks to update the state
        } catch (error) {
            console.error("Failed to save tasks:", error);
        }
    };

    const deleteEvent = async (e) => {
        const taskid = currentTask._id;
        const userid = app.currentUser.id;
        console.log('DUPADUPADUPA');
        console.log('taskID from delete task is ', taskid);
        try {
            const response = await fetch('http://localhost:3002/api/deletetask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': userid,
                    'taskid': taskid
                },
            });
            if (!response.ok) {
                throw new Error('Something went wrong!'); // Handling non-2xx responses
            }
            // Update the state to remove the deleted task
            setTasks(tasks.filter(task => task._id !== taskid));
            handleCloseModal();
        } catch (error) {
            console.error("Failed to delete task:", error);
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

    const fetchTasks = async () => {
        if (!userId) {
            setError('Please log in to see tasks');
            return;
        }
        setIsLoading(true);
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
            setTasks(data);
            setError(null);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
            setError(error.toString());
        } finally {
            setIsLoading(false);
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

    useEffect(() => {
        fetchEvents();
        fetchTasks();
    }, [userId]);

    if (isLoading) return <div>Loading...</div>; // Loading state
    if (error) return <div>{error}</div>; // Error state

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
            <form>
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
                <button type="button" onClick={updateTasks}>Save Task</button>
                <button type="button" onClick={handleCloseModal}>Cancel</button>
                <button type="button" onClick={deleteEvent}>Delete Task</button>
            </form>
        </div>
    );
}

export default EditTask;
