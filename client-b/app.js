const express = require("express");
const cors = require('cors');
const chalk = require("chalk");
const port = 8082;

const {
    AttributeIds,
    OPCUAClient,
    TimestampsToReturn,
} = require("node-opcua");

const endpointUrl = "opc.tcp://192.168.0.100:4840";
const nodeIdToMonitorTemperature = "ns=2;i=2";
const nodeIdToMonitorHumidity = "ns=2;i=3";

const client = OPCUAClient.create({
    connectionStrategy: {
        initialDelay: 1000,
        maxRetry: 100,
        maxDelay: 10000
    },
    keepSessionAlive: true,
    endpoint_must_exist: false
});

(async () => {
    try {
        console.log("connecting to", chalk.cyan(endpointUrl));
        await client.connect(endpointUrl);
        console.log("connected to", chalk.cyan(endpointUrl));
        const session = await client.createSession();
        console.log("session created");

        const subscription = await session.createSubscription2({
            requestedPublishingInterval: 2000,
            requestedMaxKeepAliveCount: 20,
            requestedLifetimeCount: 6000,
            maxNotificationsPerPublish: 1000,
            publishingEnabled: true,
            priority: 10
        });

        const app = express();
        app.use(cors());
        app.options('*', cors());
        app.set('view engine', 'html');
        app.use(express.static(__dirname + '/'));
        app.set('views', __dirname + '/');

        let valueTemperature = null;
        let valueHumidity = null;

        app.get("/sensor", function(req, res) {
            res.send({
                temperature: valueTemperature,
                humidity: valueHumidity
            });
        });

        app.use(express.static(__dirname + '/'));

        app.listen(port);

        console.log("listening on port " + port);

        const itemToMonitorTemperature = {
            nodeId: nodeIdToMonitorTemperature,
            attributeId: AttributeIds.Value
        };

        const itemToMonitorHumidity = {
            nodeId: nodeIdToMonitorHumidity,
            attributeId: AttributeIds.Value
        };

        const parameters = {
            samplingInterval: 1000,
            discardOldest: true,
            queueSize: 100
        };

        const monitoredItemTemperature = await subscription.monitor(itemToMonitorTemperature, parameters, TimestampsToReturn.Both);
        const monitoredItemHumidity = await subscription.monitor(itemToMonitorHumidity, parameters, TimestampsToReturn.Both);

        monitoredItemTemperature.on("changed", (dataValue) => {
            valueTemperature = dataValue.value.value.toString();
        });

        monitoredItemHumidity.on("changed", (dataValue) => {
            valueHumidity = dataValue.value.value.toString();
        });

    } catch (err) {
        process.exit(-1);
    }
})();