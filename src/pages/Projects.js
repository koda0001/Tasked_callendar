import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import app from '../realm/realmConfig';
import EditEvents from '../components/EditEventsForm';
import { format } from 'date-fns';
import '../css/Projects.css';

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentProject, setCurrentProject] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    events: ['',''],
  });
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

  const fetchProjects = async () => {
    if (!userId) {
      setError('Please log in to see projects');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3002/api/projects?userId=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${userId}`
        }
      });
      if (!response.ok) {
        throw new Error('Something went wrong!'); // Handling non-2xx responses
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setError(error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    if (!userId) {
      setError('Please log in to see events');
      return;
    }
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
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setError(error.toString());
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchEvents();
  }, [userId]);

  const createOrUpdateProject = async (e) => {
    e.preventDefault();
    const userid = app.currentUser.id;
    const projectid = currentProject._id;
    const bodyData = {
        userid: userid,
        title: currentProject.title,
        description: currentProject.description,
        startTime: currentProject.startTime,
        endTime: currentProject.endTime,
        events: currentProject.events,
    };
    try {
      const response = await fetch(`http://localhost:3002/api/${isEditing ? 'updateproject' : 'addproject'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userid,
          'projectid': projectid
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
      fetchProjects();
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  const deleteProject = async () => {
    const projectid = currentProject._id;
    const userid = app.currentUser.id;

    try {
      const response = await fetch('http://localhost:3002/api/deleteproject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': userid,
          'projectid' : projectid      
        },
        });
        if (!response.ok) {
          throw new Error('Something went wrong!'); // Handling non-2xx responses
        }
      } catch (error) {
        console.error("Failed to delete project:", error);
    }
    navigate('/projects');
    window.location.reload();
  };

  const handleOpenModal = (project = {}) => {
    setCurrentProject(project);
    setIsEditing(!!project.title);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProject({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      events: [],
    });
  };

  if (isLoading) return <div>Loading...</div>; // Loading state
  if (error) return <div>Please log in to see projects and events</div>; // Error state

  return (
    <div className="app">
      <button onClick={() => handleOpenModal()}>Add Project</button>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <div key={index} className="project" onClick={() => handleOpenModal(project)}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <p>Start Time: {(project.startTime).replace('T',' ')}</p>
            <p>End Time: {(project.endTime).replace('T',' ')}</p>
            <div>
              <h4>Linked Events</h4>
              <ul>
                {events.filter(event => event.linkedProject === project._id).map((event, index) => (
                  <li key={index}>
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(event); }}>{event.title}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} close={handleCloseModal} onRequestClose={handleCloseModal} contentLabel="Project Modal">
        <h2>{isEditing ? 'Edit Project' : 'Add Project'}</h2>
        <form onSubmit={createOrUpdateProject}>
          <input
            type="text"
            value={currentProject.title}
            placeholder="Title"
            onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
          />
          <textarea
            value={currentProject.description}
            placeholder="Description"
            onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
          />
          <input
            type="datetime-local"
            value={currentProject.startTime}
            onChange={(e) => setCurrentProject({ ...currentProject, startTime: e.target.value })}
          />
          <input
            type="datetime-local"
            value={currentProject.endTime}
            onChange={(e) => setCurrentProject({ ...currentProject, endTime: e.target.value })}
          />
          <button type="submit">Save Project</button>
          <button type="button" onClick={handleCloseModal}>Cancel</button>
          <button onClick={deleteProject}>Delete Task</button>
        </form>
      </Modal>
      <Modal isOpen={showEditModal} close={closeEditModal} onRequestClose={closeEditModal} contentLabel="Edit Event Modal">
        <EditEvents event={selectedEvent} date={formattedDate}/>
      </Modal>
    </div>
  );
}

export default Projects;
