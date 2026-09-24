const express = require("express");
const rules = require("../config/rules.json");

const router = express.Router();

// Demo-only login: no real auth/session system, appropriate for a hackathon prototype.
// Replace with proper auth (JWT + user table) before any real deployment.
const DEMO_OFFICER = { username: "officer1", password: "demo123", name: "Inspector A. Sharma" };

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === DEMO_OFFICER.username && password === DEMO_OFFICER.password) {
    return res.json({ name: DEMO_OFFICER.name, username });
  }
  // Also allow a one-click demo login with any credentials for judging convenience
  if (req.body.demo) {
    return res.json({ name: DEMO_OFFICER.name, username: DEMO_OFFICER.username });
  }
  res.status(401).json({ error: "Invalid credentials. Use the Demo Login button." });
});

router.get("/rules", (req, res) => {
  res.json(rules);
});

module.exports = router;
