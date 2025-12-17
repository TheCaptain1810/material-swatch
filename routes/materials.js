const express = require("express");
const {
  saveMaterialAssignment,
  getAssignmentsForUrn,
} = require("../services/db.js");

let router = express.Router();

// Save or update a material assignment
router.post("/api/materials", async function (req, res, next) {
  try {
    const { element_id, element_type, material_name, urn } = req.body;
    if (!element_id || !element_type || !material_name || !urn) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    await saveMaterialAssignment({
      element_id,
      element_type,
      material_name,
      urn,
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Get all assignments for a model
router.get("/api/materials/:urn", async function (req, res, next) {
  try {
    const assignments = await getAssignmentsForUrn(req.params.urn);
    res.json(assignments);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
