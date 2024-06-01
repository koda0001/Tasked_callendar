import React, { useState, useEffect } from "react";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import app from '../realm/realmConfig';

const formatTime = (slot) => {
  const minutesFromMidnight = slot * 15;
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  const paddedHours = hours.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');
  return `${paddedHours}:${paddedMinutes}`;
};

const parseTimeToSlot = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 4 + minutes / 15;
};

function EditEvents({ event }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [eventdate, setDate] = useState(() => format(event.date, 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(() => formatTime(event.startslot));
  const [endTime, setEndTime] = useState(() => formatTime(event.endslot));
  const [eventData, setEventData] = useState({ ...event });

  useEffect(() => {
    if (event) {
      setDate(format(event.date, 'yyyy-MM-dd'));
      setStartTime(formatTime(event.startslot));
      setEndTime(formatTime(event.endslot));
      setEventData({ ...event });
    }
  }, [event]);

  const fetchProjects = async () => {
    const userId = app.currentUser?.id;
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
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "eventdate") {
      setDate(value);
    } else if (name === "startTime") {
      setStartTime(value);
    } else if (name === "endTime") {
      setEndTime(value);
    } else {
      setEventData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventid = event._id;
    const newStartSlot = parseTimeToSlot(startTime);
    const newEndSlot = parseTimeToSlot(endTime);
    const userid = app.currentUser.id;
    const bodyData = {
        userid: userid,
        date: eventdate,
        startdate: startTime,
        enddate: endTime,
        startslot: newStartSlot,
        endslot: newEndSlot,
        title: eventData.title,
        description: eventData.description,
        linkedProject: eventData.linkedProject,
    };
    console.log('Updated Event Data:', bodyData);
    try {
      const response = await fetch('http://localhost:3002/api/updateevent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': userid,
          'eventid' : eventid      
        },
        body : JSON.stringify(bodyData)
        });
        if (!response.ok) {
          throw new Error('Something went wrong!'); // Handling non-2xx responses
        }
      } catch (error) {
        console.error("Failed to add events:", error);
      }
      navigate('/');
      window.location.reload();
  };

  const deleteEvent = async () => {
    const eventid = event._id;
    const userid = app.currentUser.id;
    try {
      const response = await fetch('http://localhost:3002/api/deleteevent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': userid,
          'eventid' : eventid      
        },
        });
        if (!response.ok) {
          throw new Error('Something went wrong!'); // Handling non-2xx responses
        }
      } catch (error) {
        console.error("Failed to add events:", error);
    }
    navigate('/');
    window.location.reload();
  };

  if (!event) return null;

  return (
    <div>
      <h1>Edit Event: {eventData.title}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Date:
          <input type="date" name="eventdate" value={eventdate} onChange={handleInputChange} />
        </label>
        <label>
          Start Time:
          <input type="time" name="startTime" value={startTime} onChange={handleInputChange} />
        </label>
        <label>
          End Time:
          <input type="time" name="endTime" value={endTime} onChange={handleInputChange} />
        </label>
        <label>
          Title:
          <input
            type="text"
            id="title"
            name="title"
            maxLength="20"
            value={eventData.title}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Description:
          <textarea
            id="description"
            name="description"
            maxLength="200"
            value={eventData.description}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Linked Project:
          <select
            name="linkedProject"
            value={eventData.linkedProject || ''}
            onChange={handleInputChange}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Save Changes</button>
      <button onClick={deleteEvent}>Delete Event</button>
      </form>
    </div>
  );
}

export default EditEvents;
