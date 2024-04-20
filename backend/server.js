const express = require('express');
const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "./config.env" });
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

async function main() {
  const Db = process.env.MONGODB_URI;
  const client = new MongoClient(Db);
  let db;

  try {
    // Connect to the MongoDB client
    
    // Access the database
    
    // Define the API endpoint
    app.get('/api/events', async (req, res) => {
      try {
        await client.connect();
        console.log("Connected to MongoDB");
        db = client.db('react');
        const eventsCollection = db.collection('events');
        const events = await eventsCollection.find().toArray();
        console.log(events); // Log all events
        res.json(events);
      } catch (error) {
        console.log("Error in fetching events:", error);
        res.status(500).json({ message: "Error fetching data", error });
      }
    });

    // Start the server
    const port = 3002;
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

  } catch (e) {
    console.error(e);
    await client.close();
  }
}

main();
