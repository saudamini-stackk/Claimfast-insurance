require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { initSocket } = require("./src/config/socket");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`ClaimFast server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });
