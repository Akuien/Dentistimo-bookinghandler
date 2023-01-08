const Booking = require("../models/BookingModel");
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

function bookingRequestHandler (topic, message) {
    
    return new Promise((resolve, reject) => {
        
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
    

  module.exports.bookingRequestHandler = bookingRequestHandler; 