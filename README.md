Create a .env file and add your WEBHOOK and FILEPATH

I use nohup but you can use whatever else you want to run it
- nohup node index.js > logwatcher.log 2>&1 &

The & means it will run even with the terminal close so it needs to be killed using the pid in the terminal.
