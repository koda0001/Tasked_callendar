import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addDays, addMonths, subMonths, addMinutes, addHours, getDay, subDays, parse } from 'date-fns';
import Modal from '../components/Modal';
import AddEvents from './AddEventsForm';
import AddWeekEvents from './AddEventsWeekForm';
import EditEvents from './EditEventsForm';
import { blue } from '@mui/material/colors';
import styles from '../css/MyCallendar.module.css';
import { da } from 'date-fns/locale/da';

const MyCalendar = ({ index, date, events = [] }) => {
  const [view, setView] = useState('month');
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
    date: date,
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
    const offsetX = 20;
    const offsetY = 20;

    const modalX = mousePosition.x + offsetX;
    const modalY = mousePosition.y + offsetY;

    return { x: modalX, y: modalY };
  };

  const eventSlots = events
    .filter(event => {
      const eventDate = new Date(event.date);
      const eventToMatch = new Date(date);
      return eventDate.toDateString() === eventToMatch.toDateString();
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      const timeA = new Date(`1970-01-01T${a.startdate}`).getTime();
      const timeB = new Date(`1970-01-01T${b.startdate}`).getTime();
      return timeA - timeB;
    })
    .map(event => {
      const startTime = event.startslot;
      const endTime = event.endslot;
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

  const openAddWeekModal = (date) => {
    setSelectedDate(date);
    setShowAddWeekModal(true);
  };

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


  const generateFullHourTimeSlots = (date) => {
    const slots = [];
    let currentTime = new Date(date.setHours(0, 0, 0, 0));
    while (currentTime <= new Date(date.setHours(23, 0, 0, 0))) {
      slots.push(new Date(currentTime));
      currentTime = addHours(currentTime, 1);
    }
    return slots;
  };

  const handleMouseDown = (index) => {
    setDragStart(index);
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
      setDragColumnDate(format(date, 'dd-MM'));

      // const offsetX = 20;
      // const offsetY = 20;
      // const modalX = mousePosition.x + offsetX;
      // const modalY = mousePosition.y + offsetY;

      const newEventStartDateTime = `${formatTime(startSlot * 15).replace(/ /g, '')}`;
      const newEventEndDateTime = `${formatTime((endSlot + 1) * 15).replace(/ /g, '')}`;

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

      // setModalPosition({ x: modalX, y: modalY });
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

  const getSlotStyle = (index, dateStr) => {
    let style = { backgroundColor: 'white', border: '1px solid black', height: '15px' };
  
    if (selectedRange && index >= selectedRange.start && index <= selectedRange.end && dragColumnDate === dateStr) {
      style.backgroundColor = blue[100];
    }
  
    events.forEach(event => {
      const eventDateStr = format(new Date(event.date), 'yyyy-MM-dd');
      if (eventDateStr === dateStr && index >= event.startslot && index <= event.endslot) {
        style.backgroundColor = blue[600];
        style.borderTopColor = blue[600];
        style.borderBottomColor = blue[600];
      }
    });
  
    return style;
  };


  const modalStyle = {
    position: 'fixed',
    top: modalPosition.y,
    left: modalPosition.x,
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    border: '1px solid black',
    padding: '20px',
    width: '200px',
    height: '300px',
    zIndex: 9999,
  };

  const renderWeekView = () => {
    const dates = generateWeekViewDates();
    const timelegendslots = generateFullHourTimeSlots(new Date());

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
          <div className={styles.timeLegend}>
            {timelegendslots.map((time, index) => (
              <div key={index} className={styles.timeLabel}>
                {format(time, 'HH:mm')}
              </div>
            ))}
          </div>
          {dates.map((date, dateIndex) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            return (
              <div
                key={dateIndex}
                onClick={() => openAddWeekModal(date)}
                className={`${styles.dayColumn} ${dateStr === format(new Date(), 'yyyy-MM-dd') ? styles.todayweek : ''}`}
              >
                {Array.from({ length: totalSlots }, (_, index) => {
                  const isSlotTaken = events.find(event => {
                    const eventDateStr = format(new Date(event.date), 'yyyy-MM-dd');
                    return eventDateStr === dateStr && index >= event.startslot && index <= event.endslot;
                  });
                  const slotStyle = getSlotStyle(index, dateStr);
                  return (
                    <div
                      key={`${index},${dateStr}`}
                      className="slot"
                      onMouseDown={() => handleMouseDown(index)}
                      onMouseUp={() => handleMouseUp(index, date)}
                      style={slotStyle}
                    >
                      {isSlotTaken && index === isSlotTaken.startslot && (
                        <span className={styles.eventTitle}>{isSlotTaken.title}</span>
                      )}
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

  const renderMonthView = () => {
    const dates = generateMonthViewDates();
  
    return (
      <div className={styles.grid}>
        {dates.map((date, index) => {
          const dayEvents = events
            .filter(event => format(new Date(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
            .sort((a, b) => a.startslot - b.startslot);
  
          return (
            <div
              key={index}
              onClick={() => openAddModal(date)}
              className={`${styles.dateCell} ${format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? styles.today : ''}`}
            >
              <h3>{format(date, 'dd')}</h3>
              {dayEvents.map((event, eventIndex) => (
                <p
                  key={eventIndex}
                  className={styles.event}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(event);
                  }}
                >
                  {event.title}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderCalendarView = () => {
    switch (view) {
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
        <button onClick={() => setView('week')} className={styles.button}>Week</button>
        <button onClick={() => setView('month')} className={styles.button}>Month</button>
        <button onClick={() => changeDate(-1)} className={styles.button}>&lt; Prev</button>
        <button onClick={() => changeDate(1)} className={styles.button}>Next &gt;</button>
      </div>
      {renderCalendarView()}
      <Modal isOpen={showAddModal} close={closeAddModal}>
        <AddEvents events={events} date={formattedDate} />
      </Modal>
      <Modal isOpen={showAddWeekModal} close={closeAddWeekModal} className="modal">
        <AddWeekEvents events={events} date={formattedDate} data={eventData} position={modalPosition} />
      </Modal>
      <Modal isOpen={showEditModal} close={closeEditModal}>
        <EditEvents event={selectedEvent} date={formattedDate} />
      </Modal>
    </div>
  );
};

export default MyCalendar;
