const express = require('express');
const router = express.Router();
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');

// Routes for /api/items
router.route('/')
  .get(getItems)
  .post(createItem);

// Routes for /api/items/:id
router.route('/:id')
  .get(getItem)
  .put(updateItem)
  .delete(deleteItem);

module.exports = router; 