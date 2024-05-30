import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import app from '../realm/realmConfig';
import EditEvents from '../components/EditEventsForm';
import EditTaskForm from '../components/EditTaskForm'; // Import EditTaskForm
import { format } from 'date-fns';
import '../css/Projects.css';

function Projects() {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null); // State for selected task
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false); // State for task modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [errorEvents, setErrorEvents] = useState(null);
  const [errorTasks, setErrorTasks] = useState(null);
  const userId = app.currentUser?.id;
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const openEditTaskModal = (task) => {
    setSelectedTask(task);
    setShowEditTaskModal(true);
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

  useEffect(() => {
    fetchEvents();
    fetchTasks();
  }, [userId]);

  if (isLoadingEvents || isLoadingTasks) return <div>Loading...</div>; // Loading state
  if (errorEvents || errorTasks) return <div>{errorEvents || errorTasks}</div>; // Error state

  return (
    <div className="app">
      <div className="projects-grid">
  <div className="events-section">
    <h2>Events</h2>
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
            .map((task, index) => (
              <button key={index} className="task-button" onClick={() => openEditTaskModal(task)}>
                <div className="task-details">
                  <p>{task.title}</p>
                  <p>Status: {task.status}</p>
                </div>
              </button>
            ))}
        </div>
      </div>
    ))}
  </div>
</div>
      <Modal isOpen={showEditModal} close={closeEditModal} onRequestClose={closeEditModal} contentLabel="Edit Event Modal">
        <EditEvents event={selectedEvent} date={formattedDate}/>
      </Modal>
      <Modal isOpen={showEditTaskModal} close={closeEditTaskModal} onRequestClose={closeEditTaskModal} contentLabel="Edit Task Modal"> {/* Task Modal */}
        <EditTaskForm task={selectedTask} />
      </Modal>
    </div>
  );
}

export default Projects;
