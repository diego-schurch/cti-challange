# cti-challange
CTI Challange
A script that accepts as an input a log file and exports a CSV with logs and extra information.

## Running Locally
For running locally place a log file into the `/data` folder and run the following command

    node index.js --file <path-log-file>
The script needs the flag --file with the path to the log file. After finishing, the CSV will be exported into the folder `/exports` with the current timestamp.

## Running with docker

 - First Create the image using the Dockerfile that is on the repo.

      `docker build -t cti_challange .`

 - Then create the container with two volumes. One for the `/exports` folder and other for the `/data` folder
	
     `docker run --name cti_challange_container -v <host-path-exports>:/app/exports -v <host-path-data>:/app/data -t -d cti_challange`

 - Finally, run the script with the --file flag pointing to the log file path. 

    `docker exec -it cti_challange_container node index.js --file data/gobankingrates.com.access.log`


