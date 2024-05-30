import React from 'react';
import Modal from '../components/Modal';

function EditTask({ task, isOpen, closeModal, handleSubmit, handleInputChange, isEditing, events }) {
    return (
        <Modal isOpen={isOpen} close={closeModal} onRequestClose={closeModal} contentLabel="Task Modal">
            <h2>{isEditing ? 'Edit Task' : 'Add Task'}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={task.title}
                    maxLength="20"
                    placeholder="Title (max 20 characters)"
                    onChange={(e) => handleInputChange('title', e.target.value)}
                />
                <textarea
                    value={task.content}
                    placeholder="Task text"
                    onChange={(e) => handleInputChange('content', e.target.value)}
                />
                <select
                    value={task.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                >
                    <option value="In progress">In progress</option>
                    <option value="On hold">On hold</option>
                    <option value="Done">Done</option>
                    <option value="Canceled">Canceled</option>
                </select>
                <select
                    value={task.linkedEvent}
                    onChange={(e) => handleInputChange('linkedEvent', e.target.value)}
                >
                    <option value="">Select Event</option>
                    {events.map(event => (
                        <option key={event._id} value={event._id}>{event.title}</option>
                    ))}
                </select>
                <button type="submit">Save Task</button>
                <button type="button" onClick={closeModal}>Cancel</button>
            </form>
        </Modal>
    );
}

export default EditTask;
