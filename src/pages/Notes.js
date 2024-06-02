import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import app from '../realm/realmConfig';
import { format } from 'date-fns';
import '../css/Notes.css';

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const date = format(new Date(), 'yyyy-MM-dd');
  const userId = app.currentUser?.id;
  const [currentNote, setCurrentNote] = useState({
    date: date,
    title: '',
    content: '',
  });

  useEffect(() => {
    const fetchNotes = async () => {
      if (!userId) {
        setError('Please log in to see notes');
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3002/api/notes?userId=${userId}`, {
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

        const formattedNotes = data.map(event => ({
          ...event,
          date: new Date(event.date)
        }));

        setNotes(formattedNotes);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        setError(error.toString());
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [userId]);

  const createOrUpdateNote = async (e) => {
    e.preventDefault();
    const notesid = currentNote._id
    const userid = app.currentUser.id;
    const bodyData = {
      userid: userid,
      date: currentNote.date,
      title: currentNote.title,
      content: currentNote.content,
    };

    try {
      const response = await fetch(`http://localhost:3002/api/${isEditing ? 'updatenote' : 'addnote'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userid,
          'notesid' : notesid   
        },
        body: JSON.stringify(bodyData),
      });
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      console.log("Connected correctly to server");
      handleCloseModal();
      setIsLoading(true);
      setError(null);
      const fetchUpdatedNotes = async () => {
        try {
          const response = await fetch(`http://localhost:3002/api/notes?userId=${userId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `${userId}`
            }
          });
          if (!response.ok) {
            throw new Error('Something went wrong!');
          }
          const data = await response.json();
          const formattedNotes = data.map(event => ({
            ...event,
            date: new Date(event.date)
          }));
          setNotes(formattedNotes);
        } catch (error) {
          console.error("Failed to fetch notes:", error);
          setError(error.toString());
        } finally {
          setIsLoading(false);
        }
      };
      fetchUpdatedNotes();
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const deleteNote = async () => {
    const noteid = currentNote._id;
    const userid = app.currentUser.id;

    try {
      const response = await fetch('http://localhost:3002/api/deletenote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': userid,
          'noteid' : noteid      
        },
        });
        if (!response.ok) {
          throw new Error('Something went wrong!');
        }
      } catch (error) {
        console.error("Failed to delete note:", error);
    }
    navigate('/notes');
    window.location.reload();
  };

  const handleOpenModal = (note = { date: date, title: '', content: '' }) => {
    setCurrentNote(note);
    setIsEditing(!!note.title);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentNote({ date: date, title: '', content: '' });
  };

  return (
    <div className="app">
      <button onClick={() => handleOpenModal()}>Add Note</button>
      <div className="notes-grid">
        {notes.map((note, index) => (
          <div key={index} className="note" onClick={() => handleOpenModal(note)}>
            {note.title}
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} close={handleCloseModal} onRequestClose={handleCloseModal} contentLabel="Note Modal">
        <h2>{isEditing ? 'Edit Note' : 'Add Note'}</h2>
        <form onSubmit={createOrUpdateNote}>
          <input
            type="text"
            value={currentNote.title}
            maxLength="20"
            placeholder="Title (max 20 characters)"
            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
          />
          <textarea
            value={currentNote.content}
            placeholder="Note text"
            onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
          />
          <button type="submit">Save Note</button>
          <button type="button" onClick={handleCloseModal}>Cancel</button>
          {isEditing ? <button type="button" onClick={deleteNote}>Delete Note</button> : ' '}
        </form>
      </Modal>
    </div>
  );
};

export default Notes;
