import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addDays, addMonths, subMonths, addMinutes, addHours, getDay, subDays } from 'date-fns';
import Modal from '../components/Modal';
import AddEvents from './AddEventsForm';
import AddWeekEvents from './AddEventsWeekForm';
import EditEvents from './EditEventsForm';
import { blueGrey } from '@mui/material/colors';
import styles from '../css/MyCallendar.module.css';
import { da } from 'date-fns/locale/da';

const MyCalendar = ({ index, date, events = [] }) => {
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddWeekModal, setShowAddWeekModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const [timeSelectionStart, setTimeSelectionStart] = useState(null);
  const [timeSelectionEnd, setTimeSelectionEnd] = useState(null);
  const totalSlots = 96;
  const startSlot = Math.min(index);
  const endSlot = Math.max(index);
  const [selectedRange, setSelectedRange] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragColumnDate, setDragColumnDate] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [eventData, setEventData] = useState({
    date: date, // use the date passed as prop
    startdate: '',
    enddate: '',
    startslot: '',
    endslot: '',
    title: '',
    description: ''
    });

  const formatTime = (minutesFromMidnight) => {
    const hours = Math.floor(minutesFromMidnight / 60);
    const minutes = minutesFromMidnight % 60;
    const paddedHours = hours % 24;
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const suffix = paddedHours >= 12 ? 'PM' : 'AM';
    const formattedHour = paddedHours > 12 ? paddedHours - 12 : paddedHours === 0 ? 12 : paddedHours;
    return `${formattedHour}:${paddedMinutes} ${suffix}`;
  };

  useEffect(() => {
    eventSlots.forEach(slot => {
        console.log(`Event '${slot.title}' occupies slots from ${startSlot} to ${endSlot}`);
        console.log(slot.date)
    });
}, [events]);

  const updateMousePosition = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  const calculateModalPosition = () => {
    // Adjust these values as needed
    const offsetX = 20; // Distance from mouse pointer
    const offsetY = 20; // Distance from mouse pointer

    const modalX = mousePosition.x + offsetX;
    const modalY = mousePosition.y + offsetY;

    return { x: modalX, y: modalY };
};

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
    title: event.title
  };
  });

  const getWeeklyEventSlots = (startDate, endDate) => {
    const eventSlots = {};
    for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
      const dateStr = format(d, 'yyyy-MM-dd');
      eventSlots[dateStr] = {};
      events.forEach(event => {
        if (format(new Date(event.date), 'yyyy-MM-dd') === dateStr) {
          for (let slot = event.startslot; slot <= event.endslot; slot++) {
            eventSlots[dateStr][slot] = {
              title: slot === event.startslot ? event.title : null
            };
          }
        }
      });
    }
    return eventSlots;
  };
  

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
  // Function to handle opening AddWeekEvents modal
  const openAddWeekModal = (date) => {
    setSelectedDate(date);
    setShowAddWeekModal(true);
  };

  // Function to close AddWeekEvents modal
  const closeAddWeekModal = () => {
    setShowAddWeekModal(false);
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
  
  const handleMouseDown = (index) => {
    setDragStart(index); 
    // console.log(index);
  };
  
  const handleMouseEnter = (time) => {
    if (timeSelectionStart) {
      setTimeSelectionEnd(time);
    }
  };
  
  const handleMouseUp = (index, date) => {
    if (dragStart !== null) {
      const startSlot = Math.min(dragStart, index);
      const endSlot = Math.max(dragStart, index);
      setDragColumnDate(format(date, 'dd-MM')); // Store the column's date
      // console.log('start slot is ',startSlot)
      // console.log('end slot is ',endSlot)      
      // console.log('date clicked is:', format(date, 'dd-MM'))

      const offsetX = 20; // Distance from mouse pointer
      const offsetY = 20; // Distance from mouse pointer
  
      const modalX = mousePosition.x + offsetX;
      const modalY = mousePosition.y + offsetY;

      // Calculate the new dates
      const newEventStartDateTime = `${date}T${formatTime(startSlot * 15).replace(/ /g, '').replace(':', 'H')}:00`;
      const newEventEndDateTime = `${date}T${formatTime((endSlot + 1) * 15).replace(/ /g, '').replace(':', 'H')}:00`;

      // Update eventData directly here
      setEventData(prevData => ({
          ...prevData,
          date: format(date, 'yyyy-MM-dd'),
          startdate: newEventStartDateTime,
          enddate: newEventEndDateTime,
          startslot: startSlot,
          endslot: endSlot
      }));

      setSelectedRange({ start: startSlot, end: endSlot });
      setDragStart(null);

      setModalPosition({ x: modalX, y: modalY });
      console.log('modal pos', modalPosition);
     

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

  const getSlotStyle = (indexdate) => {
    const [index, date] = indexdate.split(',');
    let style = { backgroundColor: 'white', border: '1px solid black' , height: '15px'};

    if (selectedRange && index >= selectedRange.start && index <= selectedRange.end && dragColumnDate === date) {
      style.backgroundColor = blueGrey[100];
    }
    eventSlots.forEach(slot => {
      if (index >= slot.startSlot && index <= slot.endSlot) {
        style.backgroundColor = blueGrey[300]; // Adjust the color to indicate the slot is taken
      }
    });
    return style;
  };
  

  const modalStyle = {
    position: 'fixed',
    top: modalPosition.y,
    left: modalPosition.x,
    transform: 'translate(-50%, -50%)', // Center the modal
    backgroundColor: 'white',
    border: '1px solid black',
    padding: '20px',
    width: '200px',
    height: '300px',
    zIndex: 9999, // Ensure the modal is on top of other elements
  };
  
  const renderWeekView = () => {
    const dates = generateWeekViewDates();
    const timelegendslots = generateFullHourTimeSlots(new Date());
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weeklyEventSlots = getWeeklyEventSlots(startDate, endDate);
  
    return (
      <div className={styles.weekContainer}>
        <div className={styles.dayLegend}>
          <div className={styles.space}></div>
          {dates.map((date, dateIndex) => (
            <div key={dateIndex} className={styles.dateColumn}>
              <h3>{format(date, 'dd.MM')}</h3>
              <h3>{format(date, 'eee')}</h3>
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
          {dates.map((date, dateIndex) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            return (
              <div
                key={dateIndex}
                onClick={() => openAddWeekModal(date)}
                className={`${styles.dayColumn} ${dateStr === format(new Date(), 'yyyy-MM-dd') ? styles.todayweek : ''}`}
              >
                {Array.from({ length: totalSlots }, (_, index) => {
                  const indexdate = `${index},${format(date, 'dd-MM')}`;
                  const isSlotTaken = weeklyEventSlots[dateStr] && weeklyEventSlots[dateStr][index];
                  const slotStyle = getSlotStyle(indexdate);
                  return (
                    <div
                      key={indexdate}
                      className="slot"
                      onMouseDown={() => handleMouseDown(index)}
                      onMouseUp={() => handleMouseUp(index, date)}
                      style={slotStyle}
                    >
                      {isSlotTaken && isSlotTaken.title && <span className={styles.eventTitle}>{isSlotTaken.title}</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
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
      <Modal isOpen={showAddWeekModal} close={closeAddWeekModal} className="modal">
        <AddWeekEvents events={events} date={formattedDate} data={eventData} position={modalPosition} />
      </Modal>
      <Modal isOpen={showEditModal} close={closeEditModal}>
        <EditEvents event={selectedEvent} date={formattedDate}/>
      </Modal>
    </div>
  );
};

export default MyCalendar;
