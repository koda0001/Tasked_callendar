const Realm = require('realm-web');
const express = require('express');
const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "./config.env" });
const realm = new Realm.App({ id: "application-0-tigozne" });
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

async function main() {
  const Db = process.env.MONGODB_URI;
  const client = new MongoClient(Db);
  let db;


  // // Create an anonymous credential
  // const credentials = Realm.Credentials.anonymous();
  // // Authenticate the user
  // const user = await realm.logIn(credentials);
  // // `App.currentUser` updates to match the logged in user
  // console.assert(user.id === realm.currentUser.id);
  // const summed = await user.functions.sum(2, 3);
  // console.assert(summed === 5);

  try {
    // Connect to the MongoDB client
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db('react');
    
    app.get('/api/events', async (req, res) => {
      try {
        const eventsCollection = db.collection('events');
        const events = await eventsCollection.find().toArray();
        console.log(events); // Log all events
        res.json(events);
      } catch (error) {
        console.log("Error in fetching events:", error);
        res.status(500).json({ message: "Error fetching data", error });
      }
    });

    app.post('/api/login', async (req, res) => {
      const { username } = req.body;
      try {
        const users = db.collection('users');
        const user = await users.find({ username });
        console.log(user); // Log all events
        res.json(users);
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
