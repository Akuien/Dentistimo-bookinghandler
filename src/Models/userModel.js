const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema(
    {
      id: {
        type: String,
      },
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      phoneNumber: {
        type: String,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("users", userSchema);
  