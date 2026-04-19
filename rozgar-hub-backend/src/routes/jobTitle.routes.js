const express = require("express");
const router = express.Router();
const { getAll, seed } = require("../controllers/jobTitle.controller");

router.get("/", getAll);
router.post("/seed", seed);

module.exports = router;