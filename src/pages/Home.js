import React, { useState, useEffect } from 'react';
import MyCalendar from '../components/MyCalendar';
import "../css/Home.css";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:3002/api/events');
        if (!response.ok) {
          throw new Error('Something went wrong!'); // Handling non-2xx responses
        }
        const data = await response.json();
        console.log("Connected correctly to server");

        const formattedEvents = data.map(event => ({
          ...event,
          date: new Date(event.date) // Ensuring date is converted to Date object
        }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setError(error.toString());
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) return <div>Loading...</div>; // Loading state
  if (error) return <div>Error: {error}</div>; // Error state

  return (
    <div className="Container">
      <div className="Home">
        <h1>My Calendar</h1>
        <MyCalendar events={events} />
        <table>
          <tbody>
            {events.map((event, index) => (
              <tr key={index}>
                <td>{event.description}</td>
                <td>{event.date.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="Menu">
        <h1>Menu</h1>
      </div>
    </div>
  );
};

export default Home;
