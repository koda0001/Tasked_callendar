import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addDays, subDays } from 'date-fns';
import styles from '../css/MyCallendar.module.css'

const MyCalendar = ({ events }) => {
  const [view, setView] = useState('week'); // Possible values: 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  // const [currentMonth, setCurrentMonth] = useState()
  const currentMonth = currentDate.getMonth();

  const firstDayOfMonth = startOfMonth(currentMonth);
  const firstDayOfMonthEEE = format(firstDayOfMonth, 'EEE'); // Full name of the day
  console.log("currentDate is ", currentDate);
  console.log("firstDayOfMonth is ", firstDayOfMonth);



  // Function to move the current date forward or backward
  const changeDate = (amount) => {
    if (view === 'day') {
      setCurrentDate(addDays(currentDate, amount));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, amount * 7));
    } else if (view === 'month') {
      setCurrentDate(addDays(currentDate, amount * 30)); // Simplistic approach
    }
  };

  // Calculate dates to show based on the current view
  let datesToShow = [];
  if (view === 'day') {
    datesToShow = [currentDate];
  } else if (view === 'week') {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    datesToShow = eachDayOfInterval({ start, end });
  } else if (view === 'month') {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    // const firstDayOfWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    // const paddingDays = getDay(start) - getDay(firstDayOfWeek);
    datesToShow = eachDayOfInterval({ start, end });
  }

  // Filter events for the current view
  const eventsToShow = events.filter(event =>
    datesToShow.some(date =>
      format(date, 'yyyy-MM-dd') === format(event.date, 'yyyy-MM-dd')
    )
  );

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.controls}>
        <button onClick={() => setView('day')} className={styles.button}>Day</button>
        <button onClick={() => setView('week')} className={styles.button}>Week</button>
        <button onClick={() => setView('month')} className={styles.button}>Month</button>
        <button onClick={() => changeDate(-1)} className={styles.button}>&lt; Prev</button>
        <button onClick={() => changeDate(1)} className={styles.button}>Next &gt;</button>
        <p className='showMonth'>{format(currentDate, 'MMMM yyyy')}</p>     
      </div>
      <div className={styles.grid}>
        {datesToShow.map(date => (
          <div key={date.toString()} className={`${styles.dateCell} ${format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? styles.today : ''}`}>
            <h3>{format(date, 'dd')}</h3>
            {eventsToShow
              .filter(event => format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
              .map(event => (
                <p key={event.description} className={styles.event}>{event.description}</p>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};


export default MyCalendar;
