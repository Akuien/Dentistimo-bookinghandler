const CircuitBreaker = require('opossum');
const appointment = require('./bookingAppointment/appointment');

//not sure yet if we need the options
const options = {
  timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trigger a failure
  resetTimeout: 30000 // After 30 seconds, try again.
};

const circuit = new CircuitBreaker(ourMqttFunctions, options);

circuit.fallback(() => {
  // Do something as a fallback, like logging the error or returning a default value
});

circuit.on('fallback', () => {
  console.log('CircuitBreaker Falling back');
});

circuit.on('success', () => {
  console.log('Success');
});

circuit.on('timeout', () => {
  console.log('Timeout');
});

circuit.on('open', () => {
  console.log('CircuitBreaker open');
});

circuit.on('halfOpen', () => {
  console.log('CircuitBreaker half open');
});

circuit.on('close', () => {
  console.log('CircuitBreaker closed');
});

async function ourMqttFunctions() {
  // Send an MQTT message here
  return;
}