const Booking = require("../models/BookingModel");
var mongoose = require('mongoose');
  // Variables
var mongoURI = process.env.MONGODB_URI || 'mongodb+srv://Dentistimo:QsyJymgvpYZZeJPc@cluster0.hnkdpp5.mongodb.net/?retryWrites=true&w=majority';
//var port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }, function(err) {
    if (err) {
        console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
        console.error(err.stack);
        process.exit(1);
    }
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
});

//mqtt connection
var mqtt = require('mqtt');
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './.env') })


const options = {
  host: '45fb8d87df7040eb8434cea2937cfb31.s1.eu.hivemq.cloud',
  port: 8883,
  protocol: 'mqtts',
  username: 'Team5@Broker',
  password: 'Team5@Broker'
}

const client = mqtt.connect(options)

// setup the callbacks
client.on('connect', function () {
  console.log('Connected Successfully');
  console.log('Listening...');
});

client.on('error', function (error) {
  console.log(error);
});


client.subscribe('BookingInfo/test', function () {
  // When a message arrives, print it to the console
  client.on('message', function (topic, message) {

    console.log("Received '" + message + "' on '" + topic + "'")
    
    const bookingInfo = JSON.parse(message);

      const newBooking= new Booking({
      user: bookingInfo.user,
      day: bookingInfo.day,
      start: bookingInfo.start,
      dentist: bookingInfo.dentist,
      issuance: bookingInfo.issuance
    })

    console.log(newBooking)
    var savedAppointment= newBooking.save();

    //Response

    let response = {
      user: bookingInfo.user,
      issuance: bookingInfo.issuance,
      start: bookingInfo.start,
    };

    let responseString = JSON.stringify(response);

                client.publish(
                  'ui/approved',
                  responseString,
                  { qos: 1, retain: false },
                  (error) => {
                    if (error) {
                      console.error(error);
                    }
                  }
                );
              });
              console.log('New Appointment Confirmed')
})
