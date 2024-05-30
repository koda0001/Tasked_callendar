import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import app from '../realm/realmConfig';
import EditEvents from '../components/EditEventsForm';
import EditTaskForm from '../components/EditTaskForm'; // Import EditTaskForm
import { format } from 'date-fns';
import '../css/Events.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorEvents, setErrorEvents] = useState(null);
  const [errorTasks, setErrorTasks] = useState(null);
  const date = format(new Date(), 'yyyy-MM-dd');
  const userId = app.currentUser?.id;
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedEvent(null);
  };

  const closeEditTaskModal = () => {
    setShowEditTaskModal(false);
    setSelectedTask(null);
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
      setErrorTasks('Please log in to see tasks');
      return;
    }
    setIsLoadingTasks(true);
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
      setErrorTasks(null);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setErrorTasks(error.toString());
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const updateTaskStatus = async (task, newStatus) => {
    const tasksid = task._id;
    const userid = app.currentUser.id;
    const bodyData = {
      userid: userid,
      date: task.date,
      title: task.title,
      content: task.content,
      status: newStatus,
      linkedEvent: task.linkedEvent // Include linkedEvent in the request body
    };

    console.log('Updating task', tasksid, 'with status', newStatus);

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

  useEffect(() => {
    fetchEvents();
    fetchTasks();
  }, [userId]);

  if (isLoadingEvents || isLoadingTasks) return <div>Loading...</div>; // Loading state
  if (errorEvents || errorTasks) return <div>{errorEvents || errorTasks}</div>; // Error state

  return (
    <div className="app">
      <div className="projects-grid">
        <h2>Events</h2>
        <div className="events-section">
          {events.map((event, index) => (
            <div key={index} className="project" onClick={() => openEditModal(event)}>
              <h3>{event.title}</h3>
              <p>Date: {format(new Date(event.date), 'MM/dd/yyyy')}</p>
              <p>Start Time: {event.startdate}</p>
              <p>End Time: {event.enddate}</p>
              <p>Description: {event.description}</p>
              <div className="tasks-section">
                <h2>Tasks</h2>
                {tasks
                  .filter(task => task.linkedEvent === event._id) // Filter tasks by linkedEvent
                  .map((task) => (
                    <div key={task._id} className="task-details" onClick={(e) => e.stopPropagation()}>
                      <p>{task.title}</p>
                      <p>Status: 
                        <select
                          value={task.status}
                          onChange={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            updateTaskStatus(task, e.target.value); // Pass task and new status
                          }}
                        >
                          <option value="In progress">In progress</option>
                          <option value="On hold">On hold</option>
                          <option value="Done">Done</option>
                          <option value="Canceled">Canceled</option>
                        </select>
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal isOpen={showEditModal} close={closeEditModal} onRequestClose={closeEditModal} contentLabel="Edit Event Modal">
        <EditEvents event={selectedEvent} date={formattedDate} />
      </Modal>
    </div>
  );
}

export default Events;
