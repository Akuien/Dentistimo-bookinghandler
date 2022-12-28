const Booking = require("../models/BookingModel");
const nodemailer = require("nodemailer");
const { generateEmailTemplate } = require("../services/mails");

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

//CIRCUIT BREAKER
const CircuitBreaker = require('opossum');


const circuitOptions = {
  timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trigger a failure
  resetTimeout: 30000 // After 30 seconds, try again.
};



bookingRequestHandler = function(topic, message) {

  return new Promise((resolve, reject) => {
    // Do something, maybe on the network or a disk

    console.log("Received '" + message + "' on '" + topic + "'")
      
    const bookingInfo = JSON.parse(message);
    console.log(bookingInfo);

    let numberOfDentists = bookingInfo.numberOfDentists;
    let numberOfAppointments = 0;

    console.log("Dentists: ", numberOfDentists);

    if(topic === 'BookingInfo/test') {
      const newBooking= new Booking({
      user: bookingInfo.user,
      day: bookingInfo.day,
      date: bookingInfo.date,
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
      if (appointment.date == bookingInfo.date && appointment.start == bookingInfo.start ) {
         numberOfAppointments++;
      }

    });
    // console.log("Current Appointments  : ", numberOfAppointments);

    if (numberOfAppointments < numberOfDentists) {
      //confirm the new booking
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

    client.publish( "ui/approved", responseString, 1, (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log("New Appointment Confirmed ")
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

      client.publish("ui/notapproved", responseString1, 1, (error) => {
          if (error) {
            console.error(error);
          } else {
            console.log("booking failed")
            // console.log(responseString)
          }
        });

        reject()
    }
  }
    )}

  })  
}




  client.subscribe('BookingInfo/test', function () {
    // When a message arrives, print it to the console
    client.on('message', function (topic, message) {

      const circuit = new CircuitBreaker(bookingRequestHandler, circuitOptions);

      circuit.fire(topic, message).then(console.log).catch(console.error);

      circuit.fallback(() => {
        // Do something as a fallback, like logging the error or returning a default value
      });
      
      circuit.on('fallback', () => {
        console.log('Sorry, out of service right now');
      });
      
      circuit.on('success', () => {
        console.log('Success');
      });
      
      circuit.on('timeout', () => {
        console.log('Circuit Breaker has Timeout');
      });
      
      circuit.on('open', () => {
        console.log('Circuit Breaker open');
      });
      
      circuit.on('halfOpen', () => {
        console.log('Circuit Breaker half open');
      });
      
      circuit.on('close', () => {
        console.log('Circuit Breaker closed');
      });

     })
  })



   client.subscribe('availability/getuserappointments', function () {
    // When a message arrives, print it to the console
    client.on('message', function (topic, message) {
  
      console.log("Received this lovely " + message + "  on " + topic + " yaay")
      
      const userDetails = JSON.parse(message);
      let userid = userDetails.user;
      // let requestid = userDetails.requestid;
  
      console.log("user: ", userid);
  
      if(topic === 'availability/getuserappointments') {
      Booking.find(
    { user: userid },
    function (err, appointments) {
      if (err) {
        return next(err);
      }
        let responseString = JSON.stringify(appointments);
        console.log(responseString)

        client.publish( "ui/userAppointmentsFound", responseString, 1, (error) => {
            if (error) {
              console.error(error);
            } else {
              console.log("sent the user appointmets to UI ")
            }
          });
    } 
      )}
  })
  })



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
  