const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;

router.get('/:username', async (req, res) => {
  try {
    const user = await userData.getUserByName(req.params.username);
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: e.message });
    return;
  }
});

module.exports = router;
