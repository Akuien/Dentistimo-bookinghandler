const Booking = require("../models/BookingModel");
const bookingHandler = require("../bookingAppointment/bookingRequestHandler");
const nodemailer = require("nodemailer");
const { generateEmailTemplate } = require("../services/mails");
var database = require('../Database/database');
var mqtt = require('mqtt');
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './.env') })
const topic = "booking/"

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

//CIRCUIT BREAKER
const CircuitBreaker = require('opossum');

const circuitOptions = {
  timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trigger a failure
  resetTimeout: 30000 // After 30 seconds, try again.
};

client.subscribe('booking/newAppointment/request')
client.subscribe('booking/getUserAppointments/request')
client.subscribe('booking/deleteappointments/request')
client.subscribe('booking/timeSlotAvailability/request')


client.on('message', async function (topic, message) {

  console.log("Received '" + message + "' on '" + topic + "'")

  //getUserAppointments
  if(topic === 'booking/getUserAppointments/request') {
    const userDetails = JSON.parse(message);
      let userid = userDetails.user;

      Booking.find(
        { user: userid },
        function (err, appointments) {
          if (err) {
            return next(err);
          }
            let responseString = JSON.stringify(appointments);
    
            client.publish( "booking/getUserAppointments/response/found", responseString, { qos: 1, retain: false }, (error) => {
                if (error) {
                  console.error(error);
                } else {
                  console.log("sent the user appointmets to UI ")
                }
              });
        } 
          )

    //deleteappointments
  } else if(topic === 'booking/deleteappointments/request') {

    const appointmentDetails = JSON.parse(message);
    let appointmentid = appointmentDetails.appointment;
    console.log("appointment: ", appointmentid);

    Booking.findOneAndDelete(
      { appointment: appointmentid },
      function (err, appointment) {
        if (err) {
          return next(err);
        }
        let responseString = JSON.stringify(appointment);
         console.log("this is the apointment to delete:" + responseString) 
          client.publish( "booking/deleteappointments/response", { qos: 1, retain: false }, (error) => {
              if (err) {
                console.error(err);
              } else {
                console.log("appointment Deleted")
              }
            });
          });
            // Receive availability check request
  } else if (topic === 'booking/timeSlotAvailability/request') {
    const { date, start } = JSON.parse(message);
        checkAppointmentAvailability(date, start, (err, availability) => {
          if (err) {
            console.error(err);
          } else {
            client.publish('booking/timeSlotAvailability/response', JSON.stringify({ available: availability }), { qos: 1, retain: false}, (error)=> {
              if (error) {
                console.error(error);
              }
            });
          }
        });
        // newAppointment
}  else if (topic === 'booking/newAppointment/request') {
  const circuit = new CircuitBreaker(bookingHandler.bookingRequestHandler, circuitOptions);

  circuit.fallback(() => 'fallback, ');
  circuit.on('fallback', () => console.log('Sorry, out of service right now'));
  
  circuit.close(() => 'close, ');
  circuit.on('close', () => console.log('Circuit Breaker Closed'));

  circuit.open(() => 'open, ');
  circuit.on('open', () => console.log('Circuit Breaker openned'));


  circuit.fire(topic, message); //.then(console.log).catch(console.error);
}
})

function checkAppointmentAvailability(date, start, callback) {
  // Find all bookings at the given time
  Booking.find({ start: start, date: date }, (err, bookings) => {
    if (err) {
      return callback(err);
    }
    // Return the availability result
    callback(null, bookings.length === 0);
  });
} 

//******************************************************************************************************** */

/*  bookingRequestHandler = function(topic, message) {

  return new Promise((resolve, reject) => {

    console.log("Received '" + message + "' on '" + topic + "'")
      
    const bookingInfo = JSON.parse(message);
    console.log(bookingInfo);

    let numberOfDentists = bookingInfo.numberOfDentists;
    let numberOfAppointments = 0;

      const newBooking= new Booking({
      user: bookingInfo.user,
      day: bookingInfo.day,
      date: bookingInfo.date,
      start: bookingInfo.start,
      dentist: bookingInfo.dentist,
      issuance: bookingInfo.issuance,
      numberOfDentists: bookingInfo.numberOfDentists
    })
  
 Booking.find(
  { dentist: bookingInfo.dentist },
  function (err, appointments) {
    if (err) {
      return next(err);
    }

    let appointmentsArray = [];
    appointmentsArray = appointments;

    appointmentsArray.forEach((appointment) => { 
      if (appointment.date == bookingInfo.date && appointment.start == bookingInfo.start ) {
         numberOfAppointments++;
      }

    });

    if (numberOfAppointments < numberOfDentists) {
      console.log("This slot is available"); 

    newBooking.save(function (error, savedAppointment) {
      if (error) {
        console.log(error);
      }

      console.log("New Appointment: " + savedAppointment);
      sendConfirmationMail(bookingInfo.email , bookingInfo.date , bookingInfo.day , bookingInfo.start) //email sending 
 
    let response = {
      user: bookingInfo.user,
      issuance: bookingInfo.issuance,
      start: bookingInfo.start,
    };

    let responseString = JSON.stringify(response);

    client.publish( "booking/newAppointment/response/approved", responseString, { qos: 1, retain: false }, (error) => {
        if (error) {
          console.error(error);
        }
      });
    })
    
    resolve("New Appointment Confirmed")

    }  else if (numberOfAppointments == numberOfDentists) {
      console.log("Sorry, this timeslot Is no longer available!! Pick another time. :)");

      let response1 = {
        user: bookingInfo.user,
        issuance: bookingInfo.issuance,
        start: "none"
      };

      let responseString1 = JSON.stringify(response1);

      client.publish("booking/newAppointment/notapproved", responseString1, { qos: 1, retain: false }, (error) => {
          if (error) {
            console.error(error);
          } else {
            console.log("booking failed")
          }
        });
      reject()
    }
  })
})  
} 

// for sending email confirmation
const sendConfirmationMail = async (bookingEmail, bookingDate, bookingDay, bookingTime) => {
  var email = bookingEmail
  var date = bookingDate
  var day = bookingDay
  var time = bookingTime

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "dentistimogroup5@gmail.com",
        pass: "xhoevjhavlqgbhvn",
      },
    });
    const mailOptions = {
      from: "dentistimogroup5@gmail.com",
      to: email,
      subject: "Booking Confirmation",
      html: generateEmailTemplate(date, day, time),
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email have been sent:- ", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};
   */