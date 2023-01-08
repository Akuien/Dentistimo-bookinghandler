const Booking = require("./models/BookingModel");
const bookingHandler = require("./Controller/bookingRequestHandler");
var database = require('./Database/database');
var mqtt = require('mqtt');
const topic = "booking/"
const CircuitBreaker = require('opossum');

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
        // newAppointment request
}  else if (topic === 'booking/newAppointment/request') {
  const circuit = new CircuitBreaker(bookingHandler.bookingRequestHandler, circuitOptions);

  circuit.fire(topic, message); //.then(console.log).catch(console.error);

  circuit.open(() => 'open, ');
  circuit.on('open', () => console.log('Circuit Breaker opened'));

  circuit.fallback(() => 'fallback, ');
  circuit.on('fallback', () => console.log('Sorry, out of service right now'));

  circuit.close(() => 'close, ')
  circuit.on('close', () => console.log('Circuit Breaker Closed'))
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