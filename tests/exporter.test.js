const ObjectsToCsv = require('objects-to-csv');
const GeoDbReader = require('@maxmind/geoip2-node').Reader;
const fs = require("fs");
const Alpine = require('alpine');

describe('Test Main Functionalities for LOG to CSV Exporter', () => {

    test("Convert Object To CSV format", async () => {
        
        const data = [{
            header1: "test1",
            header2: "test2"
        }];

        csvRow = await new ObjectsToCsv(data).toString();
        
        const [headers, firstRow] = csvRow.split("\n")

        expect(headers).toBe("header1,header2");
        expect(firstRow).toBe("test1,test2");
    });

    test("Convert IP address to Location", async () => {
        
        const dbBuffer = fs.readFileSync('GeoIPDb/GeoLite2-City.mmdb');
        const geoDbReader = GeoDbReader.openBuffer(dbBuffer);
        const geoDbResponse = geoDbReader.city("161.149.146.201");

        expect(geoDbResponse.country.isoCode).toBe("US");
        expect(geoDbResponse.subdivisions[0].isoCode).toBe("CA");

    });

    test("Parse Log to Object", async () => {

        const alpine = new Alpine("%h %s %B");
        const logData = alpine.parseLine("www.brain-salad.com 403 4321");

        expect(logData.originalLine).toBe('www.brain-salad.com 403 4321');
        expect(logData.remoteHost).toBe('www.brain-salad.com');
        expect(logData.status).toBe('403');
        expect(logData.size).toBe('4321');
    });

})