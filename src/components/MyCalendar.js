import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addDays, addMonths, subMonths, addMinutes, addHours, getDay, subDays } from 'date-fns';
import Modal from '../components/Modal';
import AddEvents from './AddEventsForm';
import EditEvents from './EditEventsForm';

import styles from '../css/MyCallendar.module.css';

const MyCalendar = ({ events = [] }) => {
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const [timeSelectionStart, setTimeSelectionStart] = useState(null);
  const [timeSelectionEnd, setTimeSelectionEnd] = useState(null);

  const [dragStart, setDragStart] = useState(null);



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
    setSelectedDate(null);
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedEvent(null);
  };

  const generateTimeSlots = (date) => {
    const slots = [];
    let currentTime = new Date(date.setHours(0, 0, 0, 0));
    while (currentTime < new Date(date.setHours(23, 59, 0, 0))) {
      slots.push(new Date(currentTime));
      currentTime = addMinutes(currentTime, 15);
    }
    return slots;
  };

  const generateFullHourTimeSlots = (date) => {
    const slots = [];
    let currentTime = new Date(date.setHours(0, 0, 0, 0)); // Start at midnight
    while (currentTime <= new Date(date.setHours(23, 0, 0, 0))) { // Go up to 23:00
      slots.push(new Date(currentTime));
      currentTime = addHours(currentTime, 1); // Add one hour
    }
    return slots;
  };  
  
  const handleMouseDown = (time) => {
    setTimeSelectionStart(time);
    setTimeSelectionEnd(time); // Initially, start and end are the same
  };
  
  const handleMouseEnter = (time) => {
    if (timeSelectionStart) {
      setTimeSelectionEnd(time);
    }
  };
  
  const handleMouseUp = () => {
    if (timeSelectionStart && timeSelectionEnd) {
      // Here you can trigger modal opening or directly add the event
      openAddModal(timeSelectionStart);
      // Reset selection
      setTimeSelectionStart(null);
      setTimeSelectionEnd(null);
    }
  };
  

  const generateMonthViewDates = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    let dates = eachDayOfInterval({ start, end });

    const paddingDaysCount = getDay(start) === 0 ? 6 : getDay(start) - 1; 
    const paddingDays = Array.from({ length: paddingDaysCount }, (_, i) => subDays(start, paddingDaysCount - i));
    return [...paddingDays, ...dates];
  };

  const generateWeekViewDates = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const timemap = (date) => {
    const timeslots = [];
    let currentTime = new Date(date.setHours(0, 0, 0, 0));
    while (currentTime < new Date(date.setHours(23, 59, 0, 0))) {
      timeslots.push(new Date(currentTime));
      currentTime = addMinutes(currentTime, 15);
    }
    return timeslots;
  };

  const renderWeekView = () => {
    const dates = generateWeekViewDates();
    const timelegendslots = generateFullHourTimeSlots(new Date());
    const timeSlots = timemap(new Date());
  
    return (
      <div className={styles.weekContainer}>
        <div className={styles.dayLegend}>
        <div className={styles.space}></div>
          {/* Render day names */}
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
            <div key={index} className={styles.dateColumn}>
              <h3>{day}</h3>
            </div>
          ))}
        </div>
        <div className={styles.gridweek}>
          {/* Render time legend */}
          <div className={styles.timeLegend}>
            {timelegendslots.map((time, index) => (
              <div key={index} className={styles.timeLabel}>
                {format(time, 'HH:mm')}
              </div>
            ))}
          </div>
          {/* Render time slots for each day */}
          {dates.map((date, dateIndex) => (
            <div key={dateIndex} className={styles.dayColumn}>
              {timeSlots.map((time, timeIndex) => (
                <div
                  key={timeIndex}
                  className={styles.timeSlot}
                  onMouseDown={() => handleMouseDown(time)}
                  onMouseEnter={() => handleMouseEnter(time)}
                  onMouseUp={handleMouseUp}
                >
                  {/* Display time slot content here if needed */}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  
  
  
  
  const renderDayView = () => {
    return (
      <div className={styles.dayView}>
        <h2>{format(currentDate, 'eeee, MMMM d, yyyy')}</h2>
        <div>
          {generateTimeSlots(currentDate).map((time, index) => (
            <div
              key={index}
              className={styles.timeSlot}
              onMouseDown={() => handleMouseDown(time)}
              onMouseEnter={() => handleMouseEnter(time)}
              onMouseUp={handleMouseUp}
            >
              {format(time, 'HH:mm')}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  

  const renderMonthView = () => {
    const dates = generateMonthViewDates();
    return (
      <div className={styles.grid}>
        {dates.map((date, index) => (
          <div key={index} onClick={() => openAddModal(date)} className={`${styles.dateCell} ${format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? styles.today : ''}`}>
            <h3>{format(date, 'dd')}</h3>
            {events.filter(event => format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
              .map((event, eventIndex) => (
                <p key={eventIndex} className={styles.event} onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(event);
                }}>{event.title}</p>
              ))}
          </div>
        ))}
      </div>
    );
  };

  const renderCalendarView = () => {
    switch (view) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      default:
        return null;
    }
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.controls}>
        <button onClick={() => setView('day')} className={styles.button}>Day</button>
        <button onClick={() => setView('week')} className={styles.button}>Week</button>
        <button onClick={() => setView('month')} className={styles.button}>Month</button>
        <button onClick={() => changeDate(-1)} className={styles.button}>&lt; Prev</button>
        <button onClick={() => changeDate(1)} className={styles.button}>Next &gt;</button>
      </div>
      {renderCalendarView()}
      <Modal isOpen={showAddModal} close={closeAddModal}>
        <AddEvents events={events} date={formattedDate}/>
      </Modal>
      <Modal isOpen={showEditModal} close={closeEditModal}>
        <EditEvents event={selectedEvent} date={formattedDate}/>
      </Modal>
    </div>
  );
};

export default MyCalendar;
