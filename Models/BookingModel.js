const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        userSSN: {
            type: Number,
            required: true,
            unique: true
        },
        clinic: {
            type: Number, //mongoose.Schema.Types.ObjectId, ref to dentists model
            ref: "UserModel"
        },
        date: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true
        }
    },
    { timestamps: true } // created at and updated at time
);

module.exports = mongoose.model("BookingModel", bookingSchema);