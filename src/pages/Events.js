import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import app from '../realm/realmConfig';
import EditEvents from '../components/EditEventsForm';
import { format, parse } from 'date-fns';
import '../css/Events.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorEvents, setErrorEvents] = useState(null);
  const [errorTasks, setErrorTasks] = useState(null);
  const date = format(new Date(), 'yyyy-MM-dd');
  const userId = app.currentUser?.id;
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedEvent(null);
  };

  const closeEditTaskModal = () => {
    setShowEditTaskModal(false);
    setSelectedTask(null);
  };

  const fetchEvents = async () => {
    if (!userId) {
      setErrorEvents('Please log in to see events');
      return;
    }
    setIsLoadingEvents(true);
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
      setEvents(data);
      setErrorEvents(null);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setErrorEvents(error.toString());
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const fetchTasks = async () => {
    if (!userId) {
      setErrorTasks('Please log in to see tasks');
      return;
    }
    setIsLoadingTasks(true);
    try {
      const response = await fetch(`http://localhost:3002/api/tasks?userId=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${userId}`
        }
      });
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }
      const data = await response.json();
      setTasks(data);
      setErrorTasks(null);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setErrorTasks(error.toString());
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const updateTaskStatus = async (task, newStatus) => {
    const tasksid = task._id;
    const userid = app.currentUser.id;
    const bodyData = {
      userid: userid,
      date: task.date,
      title: task.title,
      content: task.content,
      status: newStatus,
      linkedEvent: task.linkedEvent
    };

    console.log('Updating task', tasksid, 'with status', newStatus);

    try {
      const response = await fetch(`http://localhost:3002/api/updatetask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userid,
          'taskid': tasksid
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      console.log("Connected correctly to server");
      setIsLoading(true);
      setError(null);
      const fetchUpdatedTasks = async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/tasks?userId=${userId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `${userId}`
            }
          });
          if (!response.ok) {
            throw new Error('Something went wrong!');
          }
          const data = await response.json();
          const formattedTasks = data.map(task => ({
            ...task,
            date: new Date(task.date)
          }));
          setTasks(formattedTasks);
        } catch (error) {
          console.error("Failed to fetch tasks:", error);
          setError(error.toString());
        } finally {
          setIsLoading(false);
        }
      };
      fetchUpdatedTasks();
    } catch (error) {
      console.error("Failed to save tasks:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchTasks();
  }, [userId]);

  if (isLoadingEvents || isLoadingTasks) return <div>Loading...</div>;
  if (errorEvents || errorTasks) return <div>{errorEvents || errorTasks}</div>;

  const filteredEvents = events.filter(event => new Date(event.date).getMonth() + 1 === selectedMonth);

  const sortedEvents = filteredEvents.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
    
    const timeA = parse(a.startdate, 'hh:mma', new Date());
    const timeB = parse(b.startdate, 'hh:mma', new Date());
    return timeA - timeB;
  });

  return (
    <div className="app">
      <div className="filter-section">
        <label htmlFor="month-select">Filter by month: </label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{format(new Date(0, i), 'MMMM')}</option>
          ))}
        </select>
      </div>
      <div className="events-grid">
        <h2>Events</h2>
        <div className="events-section">
          {sortedEvents.map((event, index) => {
            const eventTasks = tasks.filter(task => task.linkedEvent === event._id);

            const totalTasks = eventTasks.length;
            const doneTasks = eventTasks.filter(task => task.status === 'Done').length;
            const percentageDone = totalTasks > 0 ? ((doneTasks / totalTasks) * 100).toFixed(2) : 0;

            return (
              <div key={index} className="event" onClick={() => openEditModal(event)}>
                <h3>{event.title}</h3>
                <p>Date: {format(new Date(event.date), 'MM/dd/yyyy')}</p>
                <p>Start Time: {event.startdate}</p>
                <p>End Time: {event.enddate}</p>
                <p>Description: {event.description}</p>
                <div className="tasks-section">
                  <h2>Tasks</h2>
                  {eventTasks.map((task) => {
                    let taskClass = '';
                    switch (task.status) {
                      case 'Done':
                        taskClass = 'task-status-done';
                        break;
                      case 'In progress':
                        taskClass = 'task-status-in-progress';
                        break;
                      case 'On hold':
                        taskClass = 'task-status-on-hold';
                        break;
                      case 'Canceled':
                        taskClass = 'task-status-canceled';
                        break;
                      default:
                        break;
                    }
                    return (
                      <div key={task._id} className={`task-details ${taskClass}`} onClick={(e) => e.stopPropagation()}>
                        <p>{task.title}</p>
                        <p>Status: 
                          <select
                            value={task.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task, e.target.value);
                            }}
                          >
                            <option value="In progress">In progress</option>
                            <option value="On hold">On hold</option>
                            <option value="Done">Done</option>
                            <option value="Canceled">Canceled</option>
                          </select>
                        </p>
                      </div>
                    );
                  })}
                  <div className="tasks-summary">
                    <h3>Tasks Summary</h3>
                    <p>Percentage Done: {percentageDone}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Modal isOpen={showEditModal} close={closeEditModal} onRequestClose={closeEditModal} contentLabel="Edit Event Modal">
        <EditEvents event={selectedEvent} date={formattedDate} />
      </Modal>
    </div>
  );
}

export default Events;
