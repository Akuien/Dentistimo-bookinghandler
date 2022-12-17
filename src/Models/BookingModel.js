const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: String, 
            ref: "UserModel"
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
            type: String,
            // required: true,
            ref: "DentistsModel"
         }/* ,
        issuance: {
            type:String,
            required: true
        } */
    },
);

module.exports = mongoose.model("bookingmodels", bookingSchema);