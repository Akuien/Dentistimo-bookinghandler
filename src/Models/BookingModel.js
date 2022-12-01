const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        appointments: [{
            type: Schema.Types.objectId,
            ref: 'BookingModel'
        }],
        description: {  //Brief explanation about the purpose of the appointment
            type: String,
            required: true,
            unique: true
        },
        user: {
            type: String, 
            ref: "UserModel"
        },
        day: {
            type: String,
            required: true,

        },
        start: {
            type: String,
            required: true,
        },
        end: {
            type: String,
            required: true
        },
        dentist: {
            type: String,
            required: true,
            ref: "DentistsModel"

        },
        issuance: {
            type:String,
            required: true
        }
    },
);

module.exports = mongoose.model("BookingModel", bookingSchema);