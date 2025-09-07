const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
const router = require("./router/main-router");
const { connectToDatabase } = require("./utils/db");

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-url.vercel.app', 'https://your-frontend-url.netlify.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api", router);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});




connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server due to DB connection error:", error);
    process.exit(1);
  });
