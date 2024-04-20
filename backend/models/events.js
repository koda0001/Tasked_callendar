const mongoose = require('mongoose');

const eventsSchema = new mongoose.Schema({
  date : String,
  desciption : String
});

const User = mongoose.model('event', eventsSchema);

module.exports = Event;
