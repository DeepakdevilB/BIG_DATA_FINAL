// Main application logic for Inventory Management System

// DOM elements
const itemsList = document.getElementById('itemsList');
const addItemForm = document.getElementById('addItemForm');
const editItemForm = document.getElementById('editItemForm');
const exportToHadoopBtn = document.getElementById('exportToHadoop');
const hadoopExportResult = document.getElementById('hadoopExportResult');
const hadoopExportDetails = document.getElementById('hadoopExportDetails');

// Bootstrap modal instances
let addItemModal;
let editItemModal;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap modals
  addItemModal = new bootstrap.Modal(document.getElementById('addItemModal'));
  editItemModal = new bootstrap.Modal(document.getElementById('editItemModal'));
  
  // Load all items
  loadItems();
  
  // Set up event listeners
  setupEventListeners();
});

// Load all items from the API
const loadItems = async () => {
  try {
    const items = await ApiService.getItems();
    displayItems(items);
  } catch (error) {
    showError('Failed to load items: ' + error.message);
  }
};

// Display items in the table
const displayItems = (items) => {
  if (items.length === 0) {
    itemsList.innerHTML = '<tr><td colspan="7" class="text-center">No items found</td></tr>';
    return;
  }
  
  itemsList.innerHTML = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>${item.supplier}</td>
      <td>${new Date(item.dateAdded).toLocaleDateString()}</td>
      <td class="action-buttons">
        <button class="btn btn-warning btn-edit" data-id="${item._id}">Edit</button>
        <button class="btn btn-danger btn-delete" data-id="${item._id}">Delete</button>
      </td>
    </tr>
  `).join('');
  
  // Add event listeners to buttons
  document.querySelectorAll('.btn-edit').forEach(button => {
    button.addEventListener('click', () => openEditModal(button.getAttribute('data-id')));
  });
  
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', () => deleteItem(button.getAttribute('data-id')));
  });
};

// Set up all event listeners
const setupEventListeners = () => {
  // Add item form submission
  addItemForm.addEventListener('submit', handleAddItem);
  
  // Edit item form submission
  editItemForm.addEventListener('submit', handleUpdateItem);
  
  // Export to Hadoop button
  exportToHadoopBtn.addEventListener('click', handleExportToHadoop);
};

// Handle adding a new item
const handleAddItem = async (event) => {
  event.preventDefault();
  
  const newItem = {
    name: document.getElementById('name').value,
    category: document.getElementById('category').value,
    quantity: parseInt(document.getElementById('quantity').value),
    price: parseFloat(document.getElementById('price').value),
    supplier: document.getElementById('supplier').value
  };
  
  try {
    await ApiService.createItem(newItem);
    addItemForm.reset();
    addItemModal.hide();
    loadItems();
    showSuccess('Item added successfully!');
  } catch (error) {
    showError('Failed to add item: ' + error.message);
  }
};

// Open the edit modal and populate with item data
const openEditModal = async (itemId) => {
  try {
    const item = await ApiService.getItem(itemId);
    
    document.getElementById('editItemId').value = item._id;
    document.getElementById('editName').value = item.name;
    document.getElementById('editCategory').value = item.category;
    document.getElementById('editQuantity').value = item.quantity;
    document.getElementById('editPrice').value = item.price;
    document.getElementById('editSupplier').value = item.supplier;
    
    editItemModal.show();
  } catch (error) {
    showError('Failed to load item details: ' + error.message);
  }
};

// Handle updating an item
const handleUpdateItem = async (event) => {
  event.preventDefault();
  
  const itemId = document.getElementById('editItemId').value;
  const updatedItem = {
    name: document.getElementById('editName').value,
    category: document.getElementById('editCategory').value,
    quantity: parseInt(document.getElementById('editQuantity').value),
    price: parseFloat(document.getElementById('editPrice').value),
    supplier: document.getElementById('editSupplier').value
  };
  
  try {
    await ApiService.updateItem(itemId, updatedItem);
    editItemModal.hide();
    loadItems();
    showSuccess('Item updated successfully!');
  } catch (error) {
    showError('Failed to update item: ' + error.message);
  }
};

// Handle deleting an item
const deleteItem = async (itemId) => {
  if (!confirm('Are you sure you want to delete this item?')) {
    return;
  }
  
  try {
    await ApiService.deleteItem(itemId);
    loadItems();
    showSuccess('Item deleted successfully!');
  } catch (error) {
    showError('Failed to delete item: ' + error.message);
  }
};

// Handle exporting to Hadoop
const handleExportToHadoop = async () => {
  try {
    const result = await ApiService.exportToHadoop();
    
    // Display the export result
    hadoopExportDetails.innerHTML = `
      <p><strong>Status:</strong> ${result.message}</p>
      <p><strong>Items Exported:</strong> ${result.exportedItems}</p>
      <p><strong>Export Path:</strong> ${result.filePath}</p>
      <p class="mt-3">Data has been successfully exported for Hadoop processing.</p>
    `;
    
    // Show the result card
    hadoopExportResult.classList.remove('d-none');
    
    // Scroll to the result
    hadoopExportResult.scrollIntoView({ behavior: 'smooth' });
    
    showSuccess('Data exported to Hadoop successfully!');
  } catch (error) {
    showError('Failed to export to Hadoop: ' + error.message);
  }
};

// Show success message (you can enhance this with a toast or alert library)
const showSuccess = (message) => {
  console.log('Success:', message);
  alert(message);
};

// Show error message (you can enhance this with a toast or alert library)
const showError = (message) => {
  console.error('Error:', message);
  alert('Error: ' + message);
}; 