const express = require("express");
const cors = require('cors');
const chalk = require("chalk");
const port = 8081;

const {
    OPCUAClient,
    AttributeIds,
    TimestampsToReturn,
    StatusCodes,
    DataType
} = require("node-opcua");

const endpointUrl = "opc.tcp://192.168.0.100:4840";
const nodeIdToMonitorTemperature = "ns=2;i=2";
const nodeIdToMonitorHumidity = "ns=2;i=3";
let session = null; 

const client = OPCUAClient.create({
    connectionStrategy: {
        initialDelay: 1000,
        maxRetry: 100,
        maxDelay: 10000
    },
    keepSessionAlive: true,
    endpoint_must_exist: false
});

const getVariable = async(nodeId) => {
    const dataValue = await session.read({nodeId, attributeId: AttributeIds.Value});
    return dataValue;
};

(async () => {
    try {
        console.log("connecting to", chalk.cyan(endpointUrl));
        await client.connect(endpointUrl);
        console.log("connected to", chalk.cyan(endpointUrl));
        session = await client.createSession();
        console.log("session created");

        const app = express();
        app.use(cors());
        app.options('*', cors());
        app.set('view engine', 'html');
        app.use(express.static(__dirname + '/'));
        app.set('views', __dirname + '/');

        app.get("/temperature", async (req, res) => {
            let dataValue = await getVariable(nodeIdToMonitorTemperature);

            res.send({
                value: dataValue.value.value.toString(),
                timestamp: dataValue.sourceTimestamp.toISOString()
            });
        });

        app.get("/humidity", async (req, res) => {
            let dataValue = await getVariable(nodeIdToMonitorHumidity);

            res.send({
                value: dataValue.value.value.toString(),
                timestamp: dataValue.sourceTimestamp.toISOString()
            });
        });

        app.use(express.static(__dirname + '/'));
        app.listen(port);
        console.log("listening on port " + port);
    } catch (err) {
        process.exit(-1);
    }
})();