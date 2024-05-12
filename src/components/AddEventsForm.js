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

function DayEventList({ events, date, index}) {
    const navigate = useNavigate();
    const totalSlots = 96;
    const [dragStart, setDragStart] = useState(null);
    const [selectedRange, setSelectedRange] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState(null);
    const containerHeight = 600; // Height of the scrollable container in pixels
    const startSlot = Math.min(dragStart, index);
    const endSlot = Math.max(dragStart, index);
    const startMinutesFromMidnight = startSlot * 15;
    const endMinutesFromMidnight = (endSlot + 1) * 15;
    console.log('date today =', date);
    // const eventStartDateTime = `${date}T${formatTime(startMinutesFromMidnight).replace(/ /g, '').replace(':', 'H')}:00`;
    // const eventEndDateTime = `${date}T${formatTime(endMinutesFromMidnight).replace(/ /g, '').replace(':', 'H')}:00`;
    const [eventData, setEventData] = useState({
    date: date, // use the date passed as prop
    startdate: '',
    enddate: '',
    startslot: '',
    endslot: '',
    title: '',
    description: ''
    });
    const eventSlots = events.filter(event => {
        // Assuming `event.date` is in a comparable format or convert it to Date if necessary
        const eventDate = new Date(event.date);
        const eventToMatch = new Date(date);
        return eventDate.toDateString() === eventToMatch.toDateString(); // Compares only the date part
    }).map(event => {
        const startTime =  event.startslot;
        const endTime =  event.endslot;

        const startTimeFormated = new Date(`${date}T${formatTime(event.startslot * 15).replace(/ /g, '').replace(':', 'H')}:00`);
        const endTimeFormated = new Date(`${date}T${formatTime(event.endslot * 15).replace(/ /g, '').replace(':', 'H')}:00`);
    
        // Convert start and end times to minutes from midnight
        const startMinutes = startTimeFormated.getHours() * 60 + startTimeFormated.getMinutes();
        const endMinutes = endTimeFormated.getHours() * 60 + endTimeFormated.getMinutes();

        console.log('Event start time: ', startTimeFormated);
    return {
        startSlot: startTime,
        endSlot: endTime,
        // startSlot: Math.floor(startMinutes / 15),
        // endSlot: Math.ceil(endMinutes / 15) - 1,
        title: event.title
    };
    });

    useEffect(() => {
        eventSlots.forEach(slot => {
            console.log(`Event '${slot.title}' occupies slots from ${startSlot} to ${endSlot}`);
            console.log(slot.date)
        });
    }, [events]);

    const handleMouseDown = (index) => {
        setDragStart(index); // Set the starting slot index
    };

    const handleMouseUp = (index) => {
        if (dragStart !== null) {
            const startSlot = Math.min(dragStart, index);
            const endSlot = Math.max(dragStart, index);
            console.log('start slot is ',startSlot)
            
            // Calculate the new dates
            const newEventStartDateTime = `${date}T${formatTime(startSlot * 15).replace(/ /g, '').replace(':', 'H')}:00`;
            const newEventEndDateTime = `${date}T${formatTime((endSlot + 1) * 15).replace(/ /g, '').replace(':', 'H')}:00`;
    
            // Update eventData directly here
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

    const getSlotStyle = (index) => {
        let style = { backgroundColor: 'white', border: '1px solid black' };
        if (selectedRange && index >= selectedRange.start && index <= selectedRange.end) {
            style.backgroundColor = blueGrey[100];
        }
        eventSlots.forEach(slot => {
            if (index >= slot.startSlot && index <= slot.endSlot) {
                style.backgroundColor = blueGrey[300]; // Adjust the color to indicate the slot is taken
            }
        });
        return style;
    };

    
    if (!selectedRange){
        return (
            <div style={{height: `${containerHeight}px`}}className="Container">
    
            <div style={{ height: `${containerHeight}px`,width: `${containerHeight/4}px`, overflowY: 'auto', border: '1px solid black' }} className="nonSelectable">
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
    }else{
        return (
            <div style={{height: `${containerHeight}px`}}className="Container">
            <div style={{ height: `${containerHeight}px`,width: `${containerHeight/4}px`, overflowY: 'auto', border: '1px solid black' }} className="nonSelectable">
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


}

export default DayEventList;
