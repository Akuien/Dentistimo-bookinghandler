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

    let numberOfDentists = bookingInfo.numberOfDentists;
    let numberOfAppointments = 0;

    console.log("Dentists: ", numberOfDentists);

    if(topic === 'BookingInfo/test') {
      const newBooking= new Booking({
      user: bookingInfo.user,
      day: bookingInfo.day,
      start: bookingInfo.start,
      dentist: bookingInfo.dentist,
      issuance: bookingInfo.issuance,
      numberOfDentists: bookingInfo.numberOfDentists
    })
     //get all appointment from the clinic
 Booking.find(
  { dentist: bookingInfo.dentist },
  function (err, appointments) {
    if (err) {
      return next(err);
    }

    let appointmentsArray = [];

   appointmentsArray = appointments;

   // console.log("Appointemnts for this den!!", appointmentsArray);
   //console.log("Appointemnts 2 !!", appointments);

    //Check Availability
    appointmentsArray.forEach((appointment) => { 
      if (appointment.day == bookingInfo.day && appointment.start == bookingInfo.start ) {
         numberOfAppointments++;
      }

    });
    // console.log("Current Appointments  : ", numberOfAppointments);

    if (numberOfAppointments < numberOfDentists) {
      //confirm the new booking
      console.log("Slot Available"); 

    newBooking.save(function (error, savedAppointment) {
      if (error) {
        console.log(error);
      }

      console.log("hie " + savedAppointment);
 
    let response = {
      user: bookingInfo.user,
      issuance: bookingInfo.issuance,
      start: bookingInfo.start,
    };

    let responseString = JSON.stringify(response);

    client.publish( "ui/approved", responseString, 1, (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log("New Appointment Confirmed ")
          // console.log(responseString)
        }
      });
    })
    }  else if (numberOfAppointments == numberOfDentists) {
      console.log("sorry Timeslot Is Fully Booked!");

      let response1 = {
        user: bookingInfo.user,
        issuance: bookingInfo.issuance,
        start: "none"
      };

      let responseString1 = JSON.stringify(response1);

      client.publish("ui/notapproved", responseString1, 1, (error) => {
          if (error) {
            console.error(error);
          } else {
            console.log("booking failed")
            // console.log(responseString)
          }
        });
    }
  }
    )}
})
   })
  