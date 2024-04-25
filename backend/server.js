const Realm = require('realm-web');
const express = require('express');
const { MongoClient } = require("mongodb");
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
        console.log(events); // Log all events
        console.log("userID: ", userId); // Log all events
        res.json(events);
      } catch (error) {
        console.log("Error in fetching events:", error);
        res.status(500).json({ message: "Error fetching data", error });
      }
    });

    // Start the server
    const port = 3002;
    exp.listen(port, () => console.log(`Server running on http://localhost:${port}`));

  } catch (e) {
    console.error(e);
    await client.close();
  }
}

main();
