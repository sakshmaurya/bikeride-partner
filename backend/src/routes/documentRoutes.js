const express = require("express");
const router = express.Router();

const {
  updateDocument,
  getUserDocuments,
} = require("../controllers/documentController");

const upload = require("../middleware/upload");

// Upload / update document
router.put("/:userId", upload.single("document"), updateDocument);

// Get user documents
router.get("/:userId", getUserDocuments);

module.exports = router;