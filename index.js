const fs = require("fs");
const es = require("event-stream");
const Alpine = require('alpine');
const DeviceDetector = require('device-detector-js');
const GeoDbReader = require('@maxmind/geoip2-node').Reader;
const ObjectsToCsv = require('objects-to-csv');
const argv = require('minimist')(process.argv.slice(2));

const alpine = new Alpine();
const deviceDetector = new DeviceDetector();
const dbBuffer = fs.readFileSync('GeoIPDb/GeoLite2-City.mmdb');
const geoDbReader = GeoDbReader.openBuffer(dbBuffer);

let rowsCounter = 0;
const timeStamp = new Date().getTime();


if(!argv.file) {
    console.log("Log file path not provided. Please add it using --file <file-path>");
    process.exit();
}

const logFilePath = argv.file;

console.log("Processing the file");
fs
    .createReadStream(logFilePath)
    .pipe(es.split())
    .pipe(
        es.map(async (line, next) => {

            let csvRow = '';
            rowsCounter++;

            if (line) {

                const logData = alpine.parseLine(line);
                const userAgentData = deviceDetector.parse(logData["RequestHeader User-agent"]);

                const data = {
                    deviceType: "No device Found",
                    browser: "No Browser Found",
                    state: "No State found in the DB",
                    country: "No Country found in the DB",
                    isBot: "NO"
                }

                if (userAgentData.bot) {
                    data.isBot = "YES";
                }
                if (userAgentData.device) {
                    if (userAgentData.client) {
                        data.browser = userAgentData.client.name
                    }
                    data.deviceType = userAgentData.device.type;
                }

                try {
                    const geoDbResponse = geoDbReader.city(logData.remoteHost);

                    if (geoDbResponse.subdivisions) {
                        const { subdivisions: [{ isoCode: stateName }] } = geoDbResponse;
                        data.state = stateName;
                    }
                    if (geoDbResponse.isoCode) {
                        const { country: { isoCode: countryName } } = geoDbResponse;
                        data.country = countryName;
                    }

                } catch (error) {
                    console.log(`Error at GEOCODING \r\t${error}`)
                }

                delete logData.originalLine;
                csvRow = await new ObjectsToCsv([{...data, ...logData}]).toString(header=rowsCounter===1);

            }
            next(null, csvRow)
        })
        .on("error", (err) => {
            console.log("Errror while Reading the file ", err)
        })
        .on("end", () => {
            console.log(`Logs Processed ${rowsCounter}`)
        })
    )
    .pipe(fs.createWriteStream(`./exports/output_${timeStamp}.csv`));

