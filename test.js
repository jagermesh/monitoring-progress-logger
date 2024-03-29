const ProgressLogger = require(`${__dirname}/index.js`);

const config = {
  sensor: {
    hubUrl: 'http://localhost:8082',
  },
};

function sleep(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

(async () => {
  const op1max = 20000;
  const op2max = 120;
  const timeout = 100;
  const progressLogger = new ProgressLogger(config.sensor.hubUrl);
  const loggerSession1 = progressLogger.createSession('Testing progress (1)');
  const loggerSession2 = progressLogger.createSession('Testing progress (2)');
  const loggerOperation11 = loggerSession1.createOperation('Main task (1)');
  const loggerOperation12 = loggerSession1.createOperation('Sub task (1)');
  const loggerOperation21 = loggerSession2.createOperation('Main task (2)');
  const loggerOperation22 = loggerSession2.createOperation('Sub task (2)');
  loggerOperation11.start(op1max);
  loggerOperation21.start(op1max);
  for (let i1 = 0; i1 < op1max; i1++) {
    loggerOperation12.start(op2max);
    loggerOperation22.start(op2max);
    for (let i2 = 0; i2 < op2max; i2++) {
      loggerOperation12.current++;
      loggerOperation22.current++;
      await sleep(timeout);
    }
    loggerOperation11.current++;
    loggerOperation21.current++;
    await sleep(timeout);
  }
  loggerSession1.finish();
  loggerSession2.finish();
})();