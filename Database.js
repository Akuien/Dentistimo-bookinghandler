var mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

var mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, function (err) {
        if (err) {
            console.error(`Failed to connect to MpngoDB with URI: ${mongoURI}`);
            console.error(err.stack);
            process.exit(1);
        }
        console.log(`Connected to MongoDB with URI: ${mongoURI}`);
    });