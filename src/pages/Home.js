import React from 'react';
import MyCalendar from '../components/MyCalendar';
import "../css/Home.css"

const Home = () => {
  const events = [
    { date: new Date(), description: 'Meeting with team.' },
    { date: new Date(), description: 'Meeting with boss.' },

    // Add more sample events here
  ];

  return (
    <div className="Container">
      <div className="Home">
        <h1>My Calendar</h1>
        <MyCalendar events={events} />
      </div>
      <div className="Menu">
        <h1>Menu</h1>

      </div>
    </div>
  );
};

export default Home;
