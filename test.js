const ProgressLogger = require(__dirname + '/index.js');

function sleep(delay) {
  return new Promise(function(resolve) {
    setTimeout(resolve, delay);
  });
}

(async function() {

  // const progressLogger = new ProgressLogger('http://vnode.edoctrina.org:8082');
  const progressLogger = new ProgressLogger();

  const loggerSession1 = progressLogger.createSession('Testing progress from JS (1)');
  const loggerSession2 = progressLogger.createSession('Testing progress from JS (2)');

  const op1max = 200;
  const op2max = 120;

  const loggerOperation11 = loggerSession1.createOperation('Main task (1)');
  const loggerOperation12 = loggerSession1.createOperation('Sub task (1)');
  const loggerOperation21 = loggerSession2.createOperation('Main task (2)');
  const loggerOperation22 = loggerSession2.createOperation('Sub task (2)');

  loggerOperation11.start(op1max);
  loggerOperation21.start(op1max);
  for(let i1 = 0; i1 < op1max; i1++) {
    loggerOperation12.start(op2max);
    loggerOperation22.start(op2max);
    for(let i2 = 0; i2 < op2max; i2++) {
      loggerOperation12.step();
      loggerOperation22.step();
      await sleep(100);
    }
    loggerOperation12.finish();
    loggerOperation22.finish();
    loggerOperation11.step();
    loggerOperation22.step();
    await sleep(100);
  }
  loggerOperation11.finish();
  loggerOperation22.finish();
})();
