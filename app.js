const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const addressRoutes = require("./routes/addressRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");



const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/availability", availabilityRoutes);




app.get("/", (req, res) => {
  res.send("ABIDANT API Running...");
});

module.exports = app;