const uuid = require('uuid');
const os = require('os');

const {
  SensorHubConnector,
} = require('monitoring-sensor');

const ProgressOperation = require(`${__dirname}/ProgressOperation.js`);

class ProgressSession {
  constructor(hubUrl, name, description) {
    this.sensorUid = uuid.v4();
    this.sensorName = os.hostname();
    this.metricUid = uuid.v4();
    this.sessionName = name;
    this.sessionDescription = description || '';

    this.operations = [];

    let metricDescriptor = {
      sensorInfo: {
        sensorUid: this.sensorUid,
        sensorName: this.sensorName,
      },
      metricInfo: {
        metricUid: this.metricUid,
        metricName: this.sessionName,
        metricRenderer: 'Progress',
      },
      metricConfig: {},
    };

    this.sensorHubConnector = new SensorHubConnector(hubUrl);

    this.sensorHubConnector.on('connect', () => {
      console.log(1);
      this.sensorHubConnector.registerMetric(metricDescriptor);
    });

    this.sensorHubConnector.on('metricRegistered', (data) => {
      if (data.metricInfo.metricUid == this.metricUid) {
        this.sendData();
      }
    });
  }

  sendData() {
    try {
      let metricData = {
        title: this.sessionName,
        subTitle: this.sessionDescription,
        operations: [],
      };
      this.operations.map((operation) => {
        if (operation.isStarted && !operation.isFinished) {
          metricData.operations.push({
            name: operation.name,
            current: operation.current,
            total: operation.total,
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
    this.operations.map((operation) => {
      operation.finish();
    });
    this.sensorHubConnector.disconnect();
  }
}

module.exports = ProgressSession;
