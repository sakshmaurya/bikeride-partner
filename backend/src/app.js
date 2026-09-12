const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { testConnection } = require("./config/db");
const { ensureSchema } = require("./config/ensureSchema");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const bankRoutes = require("./routes/bankRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const onboardingRoutes = require("./routes/onboardingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

// JSON request body
app.use(express.json());

// URL-encoded request body
app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// SERVE UPLOADED FILES
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

// =====================================================
// API ROUTES
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/documents",
  documentRoutes
);

app.use(
  "/api/bank",
  bankRoutes
);

app.use(
  "/api/vehicle",
  vehicleRoutes
);

app.use(
  "/api/onboarding",
  onboardingRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

// =====================================================
// ROOT / TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "BikeRide Partner Backend is running 🚀",
  });
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {
  console.error(
    "❌ Global Error:",
    error
  );

  res.status(500).json({
    success: false,
    message:
      error.message ||
      "Internal server error",
  });
});

// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test MySQL connection
    await testConnection();
    await ensureSchema();

    // Start Express server
    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log("");
        console.log(
          "========================================"
        );
        console.log(
          "🚀 BikeRide Partner Backend Started"
        );
        console.log(
          "========================================"
        );
        console.log(
          `🌐 Server: http://localhost:${PORT}`
        );
        console.log(
          `📱 Network: http://0.0.0.0:${PORT}`
        );
        console.log(
          `📁 Uploads: http://localhost:${PORT}/uploads`
        );
        console.log(
          "🗄️ MySQL: Connected"
        );
        console.log(
          "========================================"
        );
        console.log("");
      }
    );
  } catch (error) {
    console.error("");
    console.error(
      "========================================"
    );
    console.error(
      "❌ Server startup failed"
    );
    console.error(
      "========================================"
    );
    console.error(
      error.message
    );
    console.error("");

    process.exit(1);
  }
};

startServer();