const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity'],
    min: 0
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0
  },
  supplier: {
    type: String,
    required: [true, 'Please add a supplier'],
    trim: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Item', itemSchema); 