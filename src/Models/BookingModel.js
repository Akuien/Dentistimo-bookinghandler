const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var bookingSchema = new Schema(
    { 
        id: {
        type: String,
      },
        user: {
            type: String
        },
        day: {
            type: String
        },
        start: {
            type: String
        },
        dentist: {
            type: String
         },
        issuance: {
            type:String
        }
    },
);

module.exports = mongoose.model("booking", bookingSchema);