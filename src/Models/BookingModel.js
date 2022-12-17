const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: String
        },
        day: {
            type: String,
            // required: true,

        },
        start: {
            type: String,
            // required: true,
        },
        dentist: {
            type: String
         },
        issuance: {
            type:String,
           // required: true
        }
    },
);

module.exports = mongoose.model("bookingmodels", bookingSchema);
