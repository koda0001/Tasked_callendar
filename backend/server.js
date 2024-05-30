const Realm = require('realm-web');
const express = require('express');
const { MongoClient } = require("mongodb");
const { ObjectId } = require('mongodb');
require("dotenv").config({ path: "./config.env" });
const realm = new Realm.App({ id: "application-0-tigozne" });
const cors = require("cors");
const exp = express();


exp.use(express.json());
exp.use(cors());

async function main() {
  const Db = process.env.MONGODB_URI;
  const client = new MongoClient(Db);
  let db;
  try {
    // Connect to the MongoDB client
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db('react');
    
    exp.get('/api/events', async (req, res) => {
      try {
        const userId = req.headers.authorization
        const eventsCollection = db.collection('events');
        const events = await eventsCollection.find(
          {'userid' : `${userId}` }
        ).toArray();
        // console.log(events); // Log all events
        // console.log("userID: ", userId); // Log all events
        res.json(events);
      } catch (error) {
        console.log("Error in fetching events:", error);
        res.status(500).json({ message: "Error fetching data", error });
      }
    });
 
    exp.get('/api/projects', async (req, res) => {
      try {
        const userId = req.headers.authorization
        const projectsCollection = db.collection('projects');
        const projects = await projectsCollection.find(
          {'userid' : `${userId}` }
        ).toArray();
        // console.log(events); // Log all events
        // console.log("userID: ", userId); // Log all events
        res.json(projects);
        console.log('projects', projects);
      } catch (error) {
        console.log("Error in fetching projects:", error);
        res.status(500).json({ message: "Error fetching data", error });
      }
    });
 
    exp.get('/api/tasks', async (req, res) => {
      try {
        const userId = req.headers.authorization
        const tasksCollection = db.collection('tasks');
        const tasks = await tasksCollection.find(
          {'userid' : `${userId}` }
        ).toArray();
        // console.log(events); // Log all events
        // console.log("userID: ", userId); // Log all events
        res.json(tasks);
      } catch (error) {
        console.log("Error in fetching tasks:", error);
        res.status(500).json({ message: "Error fetching data", error });
      }
    });

    exp.get('/api/notes', async (req, res) => {
      try {
        const userId = req.headers.authorization
        const eventsCollection = db.collection('notes');
        const events = await eventsCollection.find(
          {'userid' : `${userId}` }
        ).toArray();
        // console.log(events); // Log all events
        // console.log("userID: ", userId); // Log all events
        res.json(events);
      } catch (error) {
        console.log("Error in fetching notes:", error);
        res.status(500).json({ message: "Error fetching notes", error });
      }
    });

    exp.post('/api/addevent', async (req, res) => {
      try {
        const { userid, date, startdate, enddate, startslot, endslot, title, description } = req.body; // Extracting from the body now
        const eventsCollection = db.collection('events');
        await eventsCollection.insertOne({
          userid: userid,
          date: date,
          startdate: startdate,
          enddate: enddate,
          startslot: startslot,
          endslot: endslot,
          title: title,
          description: description,
      });
        res.json({ message: "Event added successfully" });
      } catch (error) {
        console.log("Error in adding event:", error);
        res.status(500).json({ message: "Error adding event data", error });
      }
    });

    exp.post('/api/addnote', async (req, res) => {
      try {
        const { userid, date, title, content } = req.body; // Extracting from the body now
        const eventsCollection = db.collection('notes');
        await eventsCollection.insertOne({
          userid: userid,
          date: date,
          title: title,
          content: content,
      });
        res.json({ message: "Note added successfully" });
      } catch (error) {
        console.log("Error in adding note:", error);
        res.status(500).json({ message: "Error adding note data", error });
      }
    });
  
    exp.post('/api/addtask', async (req, res) => {
      try {
        const { userid, date, title, content, status } = req.body; // Extracting from the body now
        const eventsCollection = db.collection('tasks');
        await eventsCollection.insertOne({
          userid: userid,
          date: date,
          title: title,
          content: content,
          status: status // Add status to the task document
        });
        res.json({ message: "Task added successfully" });
      } catch (error) {
        console.log("Error in adding Task:", error);
        res.status(500).json({ message: "Error adding note data", error });
      }
    });

    exp.post('/api/addproject', async (req, res) => {
      try {
        const { userid, title, description, startTime, endTime, tasks, events } = req.body;
        const projectCollection = db.collection('projects');
        await projectCollection.insertOne({
          userid: userid,
          title: title,
          description: description,
          startTime: startTime,
          endTime: endTime,
          tasks: tasks,
          events: events,
        });
        res.json({ message: "Project added successfully" });
      } catch (error) {
        console.error("Error adding project:", error);
        res.status(500).json({ message: "Error adding project", error });
      }
    });

    exp.post('/api/updateevent', async (req, res) => {
      try {
        const projectId = req.headers.projectid;
        const updates = req.body;
        console.log('id: ', projectId)
        console.log('body: ', updates)
        const eventsCollection = db.collection('events');
        await eventsCollection.updateOne(
          { _id: new ObjectId(projectId) },
          { $set: updates }
        );
        res.json({ message: "Event updated successfully" });
      } catch (error) {
        console.log("Error in adding event:", error);
        res.status(500).json({ message: "Error adding event data", error });
      }
    });

    exp.post('/api/updatenote', async (req, res) => {
      try {
        const notesId = req.headers.notesid;
        const updates = req.body;
        console.log('id: ', notesId)
        console.log('body: ', updates)
        const eventsCollection = db.collection('notes');
        await eventsCollection.updateOne(
          { _id: new ObjectId(notesId) },
          { $set: updates }
        );
        res.json({ message: "Note updated successfully" });
      } catch (error) {
        console.log("Error in updateing note:", error);
        res.status(500).json({ message: "Error adding event data", error });
      }
    });

    exp.post('/api/updatetask', async (req, res) => {
      try {
        const taskId = req.headers.taskid; // Use 'taskid' header
        const updates = req.body;
        console.log('id: ', taskId);
        console.log('body: ', updates);
        const eventsCollection = db.collection('tasks');
        await eventsCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: updates }
        );
        res.json({ message: "Task updated successfully" });
      } catch (error) {
        console.log("Error in updating Task:", error);
        res.status(500).json({ message: "Error updating task", error });
      }
    });

    exp.post('/api/updateproject', async (req, res) => {
      try {
        const projectId = req.headers.projectid;
        const updates = req.body;
        const projectCollection = db.collection('projects');
        console.log('projectid in server is:', projectId);
        await projectCollection.updateOne(
          { _id: new ObjectId(projectId) },
          { $set: updates }
        );
        res.json({ message: "Project updated successfully" });
      } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ message: "Error updating project", error });
      }
    });

    exp.post('/api/deleteevent', async (req, res) => {
      try {
        const eventId = req.headers.eventid;
        console.log('id: ', eventId)
        const eventsCollection = db.collection('events');
        await eventsCollection.deleteOne(
          { _id: new ObjectId(eventId) },
        );
        res.json({ message: "Event deleted successfully" });
      } catch (error) {
        console.log("Error in deleting event:", error);
        res.status(500).json({ message: "Error deleting event ", error });
      }
    });

    const port = 3002;
    exp.listen(port, () => console.log(`Server running on http://localhost:${port}`));

  } catch (e) {
    console.error(e);
    await client.close();
  }
}

main();
