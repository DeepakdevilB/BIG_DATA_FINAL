const express = require('express');
const router = express.Router();
const { exportToHadoop } = require('../controllers/hadoopController');

// Route for exporting data to Hadoop
router.get('/export', exportToHadoop);

module.exports = router; 