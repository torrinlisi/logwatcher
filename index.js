import { existsSync, statSync, watch, createReadStream } from "fs";
import axios from "axios";
import { createInterface } from "readline";
import dotenv from "dotenv";

dotenv.config();

// Path to the file to watch
const filePath = "ENTER PATH TO FILE";

// Webhook URL
const webhookURL = process.env["WEBHOOK"];

// Function to call the webhook
async function callWebhook(playerName) {
  try {
    const response = await axios.post(webhookURL, {
      content: `User logged in: ${playerName}`,
    });
    console.log(response);
  } catch (error) {
    console.error("Error calling webhook:", error.message);
  }
}

// Watch file for updates
let fileSize = 0;
let debounceTimeout;

if (!existsSync(filePath)) {
  console.error("The file does not exist:", filePath);
  process.exit(1);
}

console.log(`Watching for changes on: ${filePath}`);

// Initial setup to get file size
fileSize = statSync(filePath).size;

// Monitor file changes
watch(filePath, (eventType) => {
  if (eventType === "change") {
    clearTimeout(debounceTimeout); // Clear the previous timeout
    debounceTimeout = setTimeout(() => {
      const newSize = statSync(filePath).size;

      if (newSize > fileSize) {
        const stream = createReadStream(filePath, {
          start: fileSize,
          end: newSize,
        });

        const rl = createInterface({ input: stream });
        rl.on("line", (line) => {
          const lineSplit = line.match(/Player connected: (.*?),/);

          if (!!lineSplit && lineSplit[1]) {
            callWebhook(lineSplit[1]);
          }
        });

        rl.on("close", () => {
          fileSize = newSize; // Update the file size after processing
        });
      }
    }, 500);
  }
});
