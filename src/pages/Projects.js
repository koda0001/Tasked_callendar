import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import app from '../realm/realmConfig';
import { format } from 'date-fns';
import '../css/Projects.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
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
  const date = format(new Date(), 'yyyy-MM-dd');

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
            <p>Start Time: {project.startTime}</p>
            <p>End Time: {project.endTime}</p>
            <div>
              <h4>Linked Events</h4>
              <ul>
                {events.filter(event => event.linkedProject === project._id).map((event, index) => (
                  <li key={index}>{event.title}</li>
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
        </form>
      </Modal>
    </div>
  );
}

export default Projects;
