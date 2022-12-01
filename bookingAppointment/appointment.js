let Dentist = require("../models/DentistsModel");
const Booking = require("../models/BookingModel");
const BookingModel = require("../src/Models/BookingModel");
let request = JSON.parse(payload);

//mqtt 
let numberOfDentists = request.numberOfDentists;
let numberOfAppointments = 0;

console.log("DentistsModel: ", numberOfDentists);

let newRequest = {

        description: request.description,
        user: request.user,
        day: request.day,
        start: request.start,
        end: request.end,
        dentist: request.dentist,
        issuance: request.issuance,
};
console.log("New Request Incoming: ", newRequest);
console.log("Current Dentist: ", request.dentist);

//getting appointemts

BookingModel.find(
    {dentist: request.dentist},
    function(error,appointments) {
        if (error) {
            return next(error);
        }
        let appointmentsArray =  appointments;
        // console.log("Appointemnts!!", appointments);

         //Check Availability
         appointmentsArray.forEach((appointment) => {
            // console.log(appointment.start);
            if (appointment.start == request.start) {
              numberOfAppointments++;
            }

            //Duplicate User
            if (
              appointment.start == request.start &&
              appointment.user == request.user
            ) {
              numberOfAppointments = 99;
            }
          });
          console.log("Current Appointments ", numberOfAppointments);

          if (numberOfAppointments < numberOfDentists) {
            //confirm the new booking
            console.log("Slot Available");

            let newAppointment = new Appointment(newRequest);

            newAppointment.save(function (error, savedAppointment) {
              if (error) {
                console.log(error);
              }

              console.log(savedAppointment);

              //Response

              let response = {
                userid: request.user,
                requestid: request.issuance,
                time: request.start,
              };

              let responseString = JSON.stringify(response);

              client.publish(
                topicResponse1,
                responseString,
                { qos: 1, retain: false },
                (error) => {
                  if (error) {
                    console.error(error);
                  }
                }
              );
            });

            resolve("New Appointment Confirmed")
          }
          //Fully Booked
          else if (numberOfAppointments == numberOfDentists) {
            console.log("Timeslot Is Fully Booked!");

            //Response

            let response = {
              userid: request.user,
              requestid: request.issuance,
              time: "none",
            };

            let responseString = JSON.stringify(response);

            client.publish(
              topicResponse2,
              responseString,
              { qos: 1, retain: false },
              (error) => {
                if (error) {
                  console.error(error);
                }
              }
            );

            reject()
          }
          //Double Booking
          else if (numberOfAppointments > numberOfDentists) {
            console.log("User Allready Has An Appointment At This Time");

            //Response

            let response = {
              userid: request.user,
              requestid: request.issuance,
              time: "none",
            };

            let responseString = JSON.stringify(response);

            client.publish(
              topicResponse3,
              responseString,
              { qos: 1, retain: false },
              (error) => {
                if (error) {
                  console.error(error);
                }
              }
            );

            reject()
          }
        }
      );
