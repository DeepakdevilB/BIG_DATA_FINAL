const Item = require('../models/Item');
const { Parser } = require('json2csv');
const fs = require('fs-extra');
const path = require('path');

// @desc    Export inventory data to CSV for Hadoop
// @route   GET /api/hadoop/export
// @access  Public
const exportToHadoop = async (req, res) => {
  try {
    // Fetch all items from database
    const items = await Item.find();
    
    if (items.length === 0) {
      return res.status(404).json({ message: 'No items found to export' });
    }
    
    // Define fields for CSV
    const fields = [
      { label: 'ID', value: '_id' },
      { label: 'Name', value: 'name' },
      { label: 'Category', value: 'category' },
      { label: 'Quantity', value: 'quantity' },
      { label: 'Price', value: 'price' },
      { label: 'Supplier', value: 'supplier' },
      { label: 'Date Added', value: 'dateAdded' }
    ];
    
    // Convert JSON to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(items);
    
    // Create export directory if it doesn't exist
    const exportDir = path.join(__dirname, '../exports');
    await fs.ensureDir(exportDir);
    
    // Write CSV to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(exportDir, `inventory_export_${timestamp}.csv`);
    await fs.writeFile(filePath, csv);
    
    // In a real environment, you would use Hadoop commands here
    // For simulation, we'll just create a log file with a message
    const hadoopSimulationLog = path.join(exportDir, 'hadoop_simulation.log');
    await fs.appendFile(
      hadoopSimulationLog,
      `[${new Date().toISOString()}] Exported ${items.length} items to HDFS at inventory_export_${timestamp}.csv\n`
    );
    
    res.status(200).json({
      message: 'Data exported successfully for Hadoop processing',
      exportedItems: items.length,
      filePath: filePath
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  exportToHadoop
}; 