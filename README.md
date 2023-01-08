# T-5-BookingHandler

## Description:
This component is responsible for handling the booking details of the appointment that was sent to it by the user interface compoenent.
It is one of the major components that makes up the whole distributed system of  Destistimo system.


## Component Resposiblities:
- Checking if a timeslot selected by a user is available.
- Processing appointment booking requests.
- Save approved booking requests to the database.
- Send booking confirmation email.
- Retriving a users booked appointments as well as deleting them upon request.

## Architectural style
- **Publish and subscribe:**

BookingHandler acts as publisher and subscriber when  sendind and recieving messages from the user interface component.

## Get started:
1. Clone the repository
2. Go to terminal and install all dependancies using: `npm install`
3. To run the component do: `cd src ` then ` node app.js`

## Technologies:
- Node.js
- MongoDB
- HiveMQ

## Authors and acknowledgment(Team Members)
- Akuen Akoi Deng
- MArwa Selwaye
- Kanokwan Haesatith
- Cynthia Tarwireyi
- Nazli Moghaddam
- Jonna Johansson

##
**More details about this system can be found in:** [Documentation](https://git.chalmers.se/courses/dit355/dit356-2022/t-5/t-5-documentation)
