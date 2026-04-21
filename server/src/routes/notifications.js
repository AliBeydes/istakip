const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Placeholder routes

router.get('/', (req, res) => {
  res.json({ message: 'Notifications route - Coming soon!' });
});

module.exports = router;
