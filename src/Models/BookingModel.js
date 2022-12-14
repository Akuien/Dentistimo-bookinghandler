const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        user: {
            required: true,
            type: mongoose.Types.ObjectId,
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
        dentist: {
            required: true,
            type: mongoose.Types.ObjectId,
            ref: "DentistsModel"
         }/* ,
        issuance: {
            type:String,
            required: true
        } */
    },
);

module.exports = mongoose.model("BookingModel", bookingSchema);