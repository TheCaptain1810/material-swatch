const express = require("express");
const { PORT } = require("./config.js");
const { initDb } = require("./services/db.js");

let app = express();
app.use(express.json());
app.use(express.static("wwwroot"));
app.use(require("./routes/auth.js"));
app.use(require("./routes/models.js"));
app.use(require("./routes/materials.js"));

// Start DB connection and server
initDb()
  .then(() => {
    app.listen(PORT, function () {
      console.log(`Server listening on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
