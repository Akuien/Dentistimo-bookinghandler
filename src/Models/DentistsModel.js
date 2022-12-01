const mongoose = require('mongoose');

const dentistSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        owner: {
            type: String,
            required: true
        },
        numberOfDentists: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true,
        },
        coordinate: {
            longitude: {
                type: String,
                required: true
            },
            latitude:{ 
                type: String,
                required: true
            }
        },
        openinghours: {
            monday: {
            type: String,
            required: true
            },
            tuesday: {
                type: String,
                required: true
            },
            wednesday: {
                type: String,
                required: true
            }, 
            thursday: {
                type: String,
                required: true
            },
            friday: {
                type: String,
                required: true
            }
        }
    }, {
        timestamps: true // created at and updated at time
});

module.exports = mongoose.model("dentists", dentistSchema);