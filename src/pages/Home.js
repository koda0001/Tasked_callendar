import React, { useState, useEffect } from 'react';
import MyCalendar from '../components/MyCalendar';
import app from '../realm/realmConfig';
import styles from '../css/Home.css'

const Home = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = app.currentUser?.id;

  useEffect(() => {
    const fetchEvents = async () => {
      if (!userId) {
        setError('Please log in to see events');
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3002/api/events?userId=${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${userId}`
          }
        });
        if (!response.ok) {
          throw new Error('Something went wrong!');
        }
        const data = await response.json();
        console.log("Connected correctly to server");

        const formattedEvents = data.map(event => ({
          ...event,
          date: new Date(event.date)
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className={StyleSheet.errorMessage}>Please log in to see events</div>;

  return (
    <div className="Container">
      <div className="Home">
        <MyCalendar events={events} />
      </div>
    </div>
  );
};

export default Home;
