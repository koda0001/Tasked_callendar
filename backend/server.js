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

    exp.post('/api/updateevent', async (req, res) => {
      try {
        const eventId = req.headers.eventid;
        const updates = req.body;
        console.log('id: ', eventId)
        console.log('body: ', updates)
        const eventsCollection = db.collection('events');
        await eventsCollection.updateOne(
          { _id: new ObjectId(eventId) },
          { $set: updates }
        );
        res.json({ message: "Event updated successfully" });
      } catch (error) {
        console.log("Error in adding event:", error);
        res.status(500).json({ message: "Error adding event data", error });
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
