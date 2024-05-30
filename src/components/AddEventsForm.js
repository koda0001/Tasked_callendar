import React, { useState, useEffect } from 'react';
import { blueGrey } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import app from '../realm/realmConfig';
import "../css/AddEvents.modal.css"

const formatTime = (minutesFromMidnight) => {
    const hours = Math.floor(minutesFromMidnight / 60);
    const minutes = minutesFromMidnight % 60;
    const paddedHours = hours % 24;
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const suffix = paddedHours >= 12 ? 'PM' : 'AM';
    const formattedHour = paddedHours > 12 ? paddedHours - 12 : paddedHours === 0 ? 12 : paddedHours;
    return `${formattedHour}:${paddedMinutes} ${suffix}`;
};

function DayEventList({ events, date, index }) {
    const navigate = useNavigate();
    const totalSlots = 96;
    const [dragStart, setDragStart] = useState(null);
    const [selectedRange, setSelectedRange] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const containerHeight = 600; // Height of the scrollable container in pixels

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
            console.log('Fetched projects:', data); // Debugging log
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setLoadingProjects(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const [eventData, setEventData] = useState({
        date: date, // use the date passed as prop
        startdate: '',
        enddate: '',
        startslot: '',
        endslot: '',
        title: '',
        description: '',
        linkedProject: ''
    });

    const eventSlots = events.filter(event => {
        const eventDate = new Date(event.date);
        const eventToMatch = new Date(date);
        return eventDate.toDateString() === eventToMatch.toDateString();
    }).map(event => {
        const startTime = event.startslot;
        const endTime = event.endslot;

        const startTimeFormated = new Date(`${date}T${formatTime(event.startslot * 15).replace(/ /g, '').replace(':', 'H')}:00`);
        const endTimeFormated = new Date(`${date}T${formatTime(event.endslot * 15).replace(/ /g, '').replace(':', 'H')}:00`);

        const startMinutes = startTimeFormated.getHours() * 60 + startTimeFormated.getMinutes();
        const endMinutes = endTimeFormated.getHours() * 60 + endTimeFormated.getMinutes();

        return {
            startSlot: startTime,
            endSlot: endTime,
            title: event.title
        };
    });

    useEffect(() => {
        eventSlots.forEach(slot => {
            console.log(`Event '${slot.title}' occupies slots from ${slot.startSlot} to ${slot.endSlot}`);
        });
    }, [events]);

    const handleMouseDown = (index) => {
        setDragStart(index);
    };

    const handleMouseUp = (index) => {
        if (dragStart !== null) {
            const startSlot = Math.min(dragStart, index);
            const endSlot = Math.max(dragStart, index);
            const newEventStartDateTime = `${date}T${formatTime(startSlot * 15).replace(/ /g, '').replace(':', 'H')}:00`;
            const newEventEndDateTime = `${date}T${formatTime((endSlot + 1) * 15).replace(/ /g, '').replace(':', 'H')}:00`;

            setEventData(prevData => ({
                ...prevData,
                startdate: newEventStartDateTime,
                enddate: newEventEndDateTime,
                startslot: startSlot,
                endslot: endSlot
            }));

            setSelectedRange({ start: startSlot, end: endSlot });
            setDragStart(null);
        }
    };

    const handleInputChange = (e) => {
        setEventData({
            ...eventData,
            [e.target.name]: e.target.value
        });
    };

    const CreateEventOnDate = async (e) => {
        const userid = app.currentUser.id;
        const bodyData = {
            userid: userid,
            date: eventData.date,
            startdate: eventData.startdate,
            enddate: eventData.enddate,
            startslot: eventData.startslot,
            endslot: eventData.endslot,
            title: eventData.title,
            description: eventData.description,
            linkedProject: eventData.linkedProject
        };
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3002/api/addevent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': userid,
                },
                body: JSON.stringify(bodyData)
            });
            if (!response.ok) {
                throw new Error('Something went wrong!');
            }
            console.log("Connected correctly to server");
        } catch (error) {
            console.error("Failed to add events:", error);
        }
        navigate('/');
        window.location.reload();
    };

    const getSlotStyle = (index) => {
        let style = { backgroundColor: 'white', border: '1px solid black' };
        if (selectedRange && index >= selectedRange.start && index <= selectedRange.end) {
            style.backgroundColor = blueGrey[100];
        }
        eventSlots.forEach(slot => {
            if (index >= slot.startSlot && index <= slot.endSlot) {
                style.backgroundColor = blueGrey[300];
            }
        });
        return style;
    };

    if (loadingProjects) {
        return <div>Loading projects...</div>;
    }

    if (!selectedRange) {
        return (
            <div style={{ height: `${containerHeight}px` }} className="Container">
                <div style={{ height: `${containerHeight}px`, width: `${containerHeight / 4}px`, overflowY: 'auto', border: '1px solid black' }} className="nonSelectable">
                    {Array.from({ length: totalSlots }, (_, index) => {
                        const minutesFromMidnight = index * 15;
                        const timeLabel = formatTime(minutesFromMidnight);
                        return (
                            <div
                                key={index}
                                className="slot"
                                onMouseDown={() => handleMouseDown(index)}
                                onMouseUp={() => handleMouseUp(index)}
                                style={getSlotStyle(index)}
                            >
                                {timeLabel}
                            </div>
                        );
                    })}
                </div>
                <div>
                    <h1>Event on: {date}</h1>
                    <p>Select time</p>
                </div>
            </div>
        );
    } else {
        return (
            <div style={{ height: `${containerHeight}px` }} className="Container">
                <div style={{ height: `${containerHeight}px`, width: `${containerHeight / 4}px`, overflowY: 'auto', border: '1px solid black' }} className="nonSelectable">
                    {Array.from({ length: totalSlots }, (_, index) => {
                        const minutesFromMidnight = index * 15;
                        const timeLabel = formatTime(minutesFromMidnight);
                        return (
                            <div
                                key={index}
                                className="slot"
                                onMouseDown={() => handleMouseDown(index)}
                                onMouseUp={() => handleMouseUp(index)}
                                style={getSlotStyle(index)}
                            >
                                {timeLabel}
                            </div>
                        );
                    })}
                </div>
                <div>
                    <h1>Event on: {date}</h1>
                    {selectedRange && (
                        <div>
                            <p>Start Time: {formatTime(selectedRange.start * 15)}</p>
                            <p>End Time: {formatTime((selectedRange.end + 1) * 15)}</p>
                        </div>
                    )}
                    <div>
                        <label htmlFor="title">Title (max 20 chars):</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            maxLength="20"
                            value={eventData.title}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="description">Description (max 200 chars):</label>
                        <textarea
                            id="description"
                            name="description"
                            maxLength="200"
                            value={eventData.description}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="linkedProject">Linked Project:</label>
                        <select
                            id="linkedProject"
                            name="linkedProject"
                            value={eventData.linkedProject}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Project</option>
                            {projects.map(project => (
                                <option key={project._id} value={project._id}>{project.title}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={CreateEventOnDate}>Save Event</button>
                </div>
            </div>
        );
    }
}

export default DayEventList;
