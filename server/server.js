const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// API routes
app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
