import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import * as Realm from "realm-web";
import app from '../realm/realmConfig';


const CreateEvent = ({ date, close }) => {
    const navigate = useNavigate();
    const [eventData, setEventData] = useState({
        date: date, // use the date passed as prop
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
            throw new Error('Something went wrong!'); // Handling non-2xx responses
            }
            const data = await response.json();
            console.log("Connected correctly to server");
        } catch (error) {
            console.error("Failed to add events:", error);
        }
        navigate('/');
        window.location.reload();
};

return (
    <form onSubmit={CreateEventOnDate}>
        <label>
        Date:
        <input type="text" name="date" value={eventData.date} onChange={handleInputChange} readOnly />
        </label>
        <label>
        Title:
        <input type="text" name="title" value={eventData.title} onChange={handleInputChange} />
        </label>
        <label>
        Description:
        <input type="text" name="description" value={eventData.description} onChange={handleInputChange} />
        </label>
        <button type="submit">Save Event</button>
        <button type="button" onClick={close}>Cancel</button>
    </form>
    );
};

export default CreateEvent;
