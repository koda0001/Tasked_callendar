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

function DayEventList({ events, date, data, position}) {
    const navigate = useNavigate();
    const totalSlots = 96;
    const [dragStart, setDragStart] = useState(null);
    const [selectedRange, setSelectedRange] = useState(null);
    const containerHeight = 600; // Height of the scrollable container in pixels
    const newEventStartDateTime = `${formatTime(data.startslot * 15).replace(/ /g, '')}`;
    const newEventEndDateTime = `${formatTime((data.endslot + 1) * 15).replace(/ /g, '')}`;
    const [eventData, setEventData] = useState({
    date: data.date, // use the date passed as prop
    startdate: newEventStartDateTime,
    enddate: newEventEndDateTime,
    startslot: data.startslot,
    endslot: data.endslot,
    title: '',
    description: ''
    });


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
            description: eventData.description
        };
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3002/api/addevent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': userid,
                
                },
                body : JSON.stringify(bodyData)
            });
            if (!response.ok) {
            throw new Error('Something went wrong!');
            }
            // const data = await response.json();
            console.log("Connected correctly to server");
        } catch (error) {
            console.error("Failed to add events:", error);
        }
        navigate('/');
        window.location.reload();
    };

    return (
        
        

        <div style={{height: `${containerHeight}px`}}className="Container">
        
        <div>
            <h1>Event on: {date}</h1>
            <p>From: {formatTime(data.startslot*15)}</p>
            <p>To: {formatTime(data.endslot*15)}</p>
                {selectedRange && (
                    <div>
                        <p onChange={handleInputChange}>Start Time: {formatTime(selectedRange.start * 15)}</p>
                        <p onChange={handleInputChange}>End Time: {formatTime((selectedRange.end + 1) * 15)}</p>
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
            <button onClick={CreateEventOnDate}>Save Event</button>
        </div>
        </div>
        
    );
    

}

export default DayEventList;
