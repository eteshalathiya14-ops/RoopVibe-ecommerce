const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

//add routes
const navbarRoutes = require("./routes/navbarroutes");



dotenv.config();

const connectDB = require("./config/connection");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/api/navbar", navbarRoutes);


const startServer = async () => {
  try {
    // MongoDB Connection
    await connectDB();

    console.log(" MongoDB Connected Successfully");

    // Start Server
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error(" Failed to start application:");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();