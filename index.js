const uuid = require('uuid');
const os = require('os');

const { SensorHubConnector } = require('monitoring-sensor');

class ProgressOperation {

  constructor(session, name) {
    const _this = this;

    this.isStarted  = false;
    this.isFinished = false;
    this.opCurrent  = 0;
    this.opTotal    = 0;
    this.opName     = name;
    this.session    = session;
  }

  start(total) {
    this.isStarted  = true;
    this.isFinished = false;
    this.opCurrent  = 0;
    this.opTotal    = total;
    this.session.sendData();
  }

  get total() {
    return this.opTotal;
  }

  set total(value) {
    this.opTotal = value;
    this.session.sendData();
  }

  get current() {
    return this.opCurrent;
  }

  set current(value) {
    this.opCurrent = value;
    this.session.sendData();
  }

  get name() {
    return this.opName;
  }

  set name(value) {
    this.opName = value;
    this.session.sendData();
  }

  finish() {
    this.opCurrent  = this.opTotal;
    this.isFinished = true;
    this.isStarted  = false;
    this.session.sendData();
  }

}

class ProgressSession {

  constructor(hubUrl, name) {
    const _this = this;

    this.sensorUid  = uuid.v4();
    this.sensorName = os.hostname();
    this.metricUid  = uuid.v4();
    this.metricName = name;

    this.operations = [];

    let metricDescriptor = {
      sensorInfo: {
        sensorUid: _this.sensorUid,
        sensorName: _this.sensorName,
      },
      metricInfo: {
        metricUid: _this.metricUid,
        metricName: _this.metricName,
        metricRenderer: 'Progress',
      },
      metricConfig: {
      }
    };

    this.sensorHubConnector = new SensorHubConnector(hubUrl);

    this.sensorHubConnector.on('connect', function() {
      _this.sensorHubConnector.registerMetric(metricDescriptor);
    });

    this.sensorHubConnector.on('metricRegistered', function(data) {
      if (data.metricInfo.metricUid == _this.metricUid) {
        _this.sendData();
      }
    });
  }

  sendData() {
    try {
      let metricData = {
        title:      this.metricName
      , operations: []
      };
      this.operations.map(function(operation) {
        if (operation.isStarted && !operation.isFinished) {
          metricData.operations.push({
            name:    operation.name
          , current: operation.current
          , total:   operation.total
          });
        }
      });
      this.sensorHubConnector.sendData(this.metricUid, metricData);
    } catch (error) {
      console.log(error);
    }
  }

  createOperation(name) {
    let progressOperation = new ProgressOperation(this, name);
    this.operations.push(progressOperation);
    return progressOperation;
  }

  finish() {
    this.operations.map(function(operation) {
      operation.finish();
    });
    this.sensorHubConnector.disconnect();
  }

}

class ProgressLogger {

  constructor(hubUrl) {
    this.hubUrl = hubUrl ? hubUrl : 'http://localhost:8082';
  }

  createSession(name) {
    return new ProgressSession(this.hubUrl, name);
  }

}

module.exports = ProgressLogger;