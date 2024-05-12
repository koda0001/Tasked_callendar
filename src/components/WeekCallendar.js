import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addDays, addMonths, subMonths, getDay, subDays } from 'date-fns';
import Modal from '../components/Modal';
import AddEvents from './AddEventsForm';
import EditEvents from './EditEventsForm';

import styles from '../css/MyCallendar.module.css'; // Update the path as needed

const WeekCallendar = ({ events = [] }) => {
  const [view, setView] = useState('month'); // Initial view
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const changeDate = (amount) => {
    if (view === 'day') {
      setCurrentDate(addDays(currentDate, amount));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, amount * 7));
    } else if (view === 'month') {
      setCurrentDate(amount > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    }
  };

  const openAddModal = (date) => {
    setSelectedDate(date);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setShowAddModal(null);
  };
  const openEditModal = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedEvent(null);  // Reset selected event on close
  };


  const generateMonthViewDates = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    let dates = eachDayOfInterval({ start, end });

    const paddingDaysCount = getDay(start) === 0 ? 6 : getDay(start) - 1; // Adjust based on week starting on Monday
    const paddingDays = Array.from({ length: paddingDaysCount }, (_, i) => subDays(start, paddingDaysCount - i));
    return [...paddingDays, ...dates];
  };
  const generateWeekViewDates = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  let datesToShow = [];
  if (view === 'month') {
    datesToShow = generateMonthViewDates();
  } // Extend with 'day' and 'week' views as necessary

  if (view === 'week') {
    datesToShow = generateWeekViewDates();
  }
  // Filter events for displayed dates
  const eventsToShow = events.filter(event =>
    datesToShow.some(date => format(date, 'yyyy-MM-dd') === format(event.date, 'yyyy-MM-dd'))
  );

  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.controls}>
        <button onClick={() => setView('day')} className={styles.button}>Day</button>
        <button onClick={() => setView('week')} className={styles.button}>Week</button>
        <button onClick={() => setView('month')} className={styles.button}>Month</button>
        <button onClick={() => changeDate(-1)} className={styles.button}>&lt; Prev</button>
        <button onClick={() => changeDate(1)} className={styles.button}>Next &gt;</button>
      </div>
      <div className={styles.grid}>
        {datesToShow.map((date, index) => (
          <div key={index} onClick={() => openAddModal(date)} className={`${styles.dateCell} ${format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? styles.today : ''}`}>
            <h3>{format(date, 'dd')}</h3>
            {eventsToShow
              .filter(event => format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
              .map((event, eventIndex) => (
                
                <p key={eventIndex} className={styles.event} onClick={(e) => {
                  e.stopPropagation();  // Prevent the date cell click event
                  openEditModal(event);
                }}>{event.title}</p>
              ))}
          </div>
        ))}
      </div>
        <Modal isOpen={showAddModal} close={closeAddModal}>
          <AddEvents events={events} date={formattedDate}/>
        </Modal>
        <Modal isOpen={showEditModal} close={closeEditModal}>
         <EditEvents event={selectedEvent} date={formattedDate}/>
        </Modal>

    </div>
  );
};

export default WeekCallendar;
