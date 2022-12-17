/* var mqtt = require('mqtt');

const client = mqtt.connect({
    host: '5f8b74c7be3745769c00bbb62e5f86b5.s2.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'Cynthea',
    password: 'Cynthia1997'
  })


// setup the callbacks
client.on('connect', function () {
    console.log('Connected Successfully');
});

client.on('error', function (error) {
    console.log(error);
});


client.on('message', function (topic, message) {
    // called each time a message is received
    console.log('Received message:', topic, message.toString());
});

// subscribe to topic 'my/test/topic'
client.subscribe('my/test/topic6');
client.subscribe('my/test/topic5');


// publish message 'Hello' to topic 'my/test/topic'
client.publish('my/test/topic3', 'Hello, hope this is the dentist handler');
client.publish('my/test/topic4', 'Sup Mr Dentist, I need my tooth out');
 */