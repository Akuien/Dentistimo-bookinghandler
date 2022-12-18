# T-5-BookingHandler

## Description:
This component is responsible for handling the booking details of the appointment that was sent to it by the user interface compoenent.
It is one of the major components that makes up the whole distributed system of  Destistimo system.


## Component Responiblities:
- Collect valid appointment information from user interface component.
- Forward aforementioned data into the database.

## Architectural style
- **Publish and subscribe:**

BookingHandler acts as subscriber when recieving the booking infomation from the user interface component, and then save the recieved data into the MongoDB database.

## Get started:
1. Clone the repository
2. Go to terminal and install all dependancies using: `npm install`
3. To run the component do: `cd src ` and `cd bookingAppointment`  then  ` node appointment.js`

## Technologies:
- Node.js
- MongoDB
- HiveMQ
- node-fetch

## Authors and acknowledgment(Team Members)
- Akuen Akoi Deng
- MArwa Selwaye
- Kanokwan Haesatith
- Cynthia Tarwireyi
- Nazli Moghaddam
- Jonna Johansson
- Sergey Balan

##
**More details about this system can be found in:** [Documentation](https://git.chalmers.se/courses/dit355/dit356-2022/t-5/t-5-documentation)
