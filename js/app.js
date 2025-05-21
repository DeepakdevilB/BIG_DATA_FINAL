// Main application logic for Inventory Management System

// DOM elements
const itemsList = document.getElementById('itemsList');
const addItemForm = document.getElementById('addItemForm');
const editItemForm = document.getElementById('editItemForm');
const exportToHadoopBtn = document.getElementById('exportToHadoop');
const hadoopExportResult = document.getElementById('hadoopExportResult');
const hadoopExportDetails = document.getElementById('hadoopExportDetails');
const lowStockTable = document.getElementById('lowStockTable');

// Views
const dashboardView = document.getElementById('dashboardView');
const inventoryView = document.getElementById('inventoryView');
const reportsView = document.getElementById('reportsView');

// Navigation links
const dashboardLink = document.getElementById('dashboardLink');
const inventoryLink = document.getElementById('inventoryLink');
const reportsLink = document.getElementById('reportsLink');

// Summary elements
const totalItemsCount = document.getElementById('totalItemsCount');
const totalInventoryValue = document.getElementById('totalInventoryValue');
const totalQuantity = document.getElementById('totalQuantity');
const lowStockCount = document.getElementById('lowStockCount');

// Bootstrap modal instances
let addItemModal;
let editItemModal;

// Active view tracker
let currentView = 'dashboard';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap modals
  addItemModal = new bootstrap.Modal(document.getElementById('addItemModal'));
  editItemModal = new bootstrap.Modal(document.getElementById('editItemModal'));
  
  // Initialize charts
  if (window.ChartManager) {
    window.ChartManager.initialize();
  }
  
  // Load all data
  loadDashboardData();
  loadItems();
  
  // Set up event listeners
  setupEventListeners();
  
  // Set active link
  dashboardLink.classList.add('active');
});

// Load dashboard data
const loadDashboardData = async () => {
  try {
    // Load summary data
    const summary = await ApiService.getInventorySummary();
    updateSummaryCards(summary);
    
    // Load low stock items
    const lowStockItems = await ApiService.getLowStockItems();
    displayLowStockItems(lowStockItems);
    
    // Update charts
    if (window.ChartManager) {
      window.ChartManager.updateAll();
    }
  } catch (error) {
    showError('Failed to load dashboard data: ' + error.message);
  }
};

// Update summary cards with data
const updateSummaryCards = (summary) => {
  if (totalItemsCount) totalItemsCount.textContent = summary.totalItems;
  if (totalInventoryValue) totalInventoryValue.textContent = `$${summary.totalValue.toFixed(2)}`;
  if (totalQuantity) totalQuantity.textContent = summary.totalQuantity;
  if (lowStockCount) lowStockCount.textContent = summary.lowStockCount;
};

// Display low stock items in the table
const displayLowStockItems = (items) => {
  if (!lowStockTable) return;
  
  if (items.length === 0) {
    lowStockTable.innerHTML = '<tr><td colspan="6" class="text-center">No low stock items</td></tr>';
    return;
  }
  
  lowStockTable.innerHTML = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td><span class="text-warning fw-bold">${item.quantity}</span></td>
      <td>${item.minStockLevel}</td>
      <td>${item.supplier}</td>
      <td>
        <button class="btn btn-sm btn-primary btn-restock" data-id="${item._id}">
          <i class="bi bi-plus-circle"></i> Restock
        </button>
      </td>
    </tr>
  `).join('');
  
  // Add event listeners to restock buttons
  document.querySelectorAll('.btn-restock').forEach(button => {
    button.addEventListener('click', () => openRestockModal(button.getAttribute('data-id')));
  });
};

// Open restock modal (reuses the edit modal but focuses on quantity)
const openRestockModal = async (itemId) => {
  try {
    const item = await ApiService.getItem(itemId);
    
    document.getElementById('editItemId').value = item._id;
    document.getElementById('editName').value = item.name;
    document.getElementById('editCategory').value = item.category;
    document.getElementById('editQuantity').value = item.quantity;
    document.getElementById('editPrice').value = item.price;
    document.getElementById('editSupplier').value = item.supplier;
    document.getElementById('editMinStockLevel').value = item.minStockLevel || 10;
    
    // Focus on quantity field
    setTimeout(() => {
      document.getElementById('editQuantity').focus();
      document.getElementById('editQuantity').select();
    }, 500);
    
    editItemModal.show();
  } catch (error) {
    showError('Failed to load item details: ' + error.message);
  }
};

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
  if (!itemsList) return;
  
  if (items.length === 0) {
    itemsList.innerHTML = '<tr><td colspan="8" class="text-center">No items found</td></tr>';
    return;
  }
  
  itemsList.innerHTML = items.map(item => {
    // Highlight low stock items
    const quantityClass = item.quantity <= (item.minStockLevel || 10) ? 'text-danger fw-bold' : '';
    
    return `
      <tr>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td class="${quantityClass}">${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>${item.minStockLevel || 10}</td>
        <td>${item.supplier}</td>
        <td>${new Date(item.dateAdded).toLocaleDateString()}</td>
        <td class="action-buttons">
          <button class="btn btn-sm btn-warning btn-edit" data-id="${item._id}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-delete" data-id="${item._id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
  
  // Add event listeners to buttons
  document.querySelectorAll('.btn-edit').forEach(button => {
    button.addEventListener('click', () => openEditModal(button.getAttribute('data-id')));
  });
  
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', () => deleteItem(button.getAttribute('data-id')));
  });
};

// Switch between views (dashboard, inventory, reports)
const switchView = (viewName) => {
  // Hide all views
  dashboardView.classList.add('d-none');
  inventoryView.classList.add('d-none');
  reportsView.classList.add('d-none');
  
  // Remove active class from all links
  dashboardLink.classList.remove('active');
  inventoryLink.classList.remove('active');
  reportsLink.classList.remove('active');
  
  // Show the selected view and mark its link as active
  switch(viewName) {
    case 'dashboard':
      dashboardView.classList.remove('d-none');
      dashboardLink.classList.add('active');
      loadDashboardData();
      break;
    case 'inventory':
      inventoryView.classList.remove('d-none');
      inventoryLink.classList.add('active');
      loadItems();
      break;
    case 'reports':
      reportsView.classList.remove('d-none');
      reportsLink.classList.add('active');
      if (window.ChartManager) {
        window.ChartManager.updateAll();
      }
      break;
  }
  
  currentView = viewName;
};

// Set up all event listeners
const setupEventListeners = () => {
  // Add item form submission
  if (addItemForm) {
    addItemForm.addEventListener('submit', handleAddItem);
  }
  
  // Edit item form submission
  if (editItemForm) {
    editItemForm.addEventListener('submit', handleUpdateItem);
  }
  
  // Export to Hadoop button
  if (exportToHadoopBtn) {
    exportToHadoopBtn.addEventListener('click', handleExportToHadoop);
  }
  
  // Navigation links
  if (dashboardLink) {
    dashboardLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('dashboard');
    });
  }
  
  if (inventoryLink) {
    inventoryLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('inventory');
    });
  }
  
  if (reportsLink) {
    reportsLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('reports');
    });
  }
};

// Handle adding a new item
const handleAddItem = async (event) => {
  event.preventDefault();
  
  const newItem = {
    name: document.getElementById('name').value,
    category: document.getElementById('category').value,
    quantity: parseInt(document.getElementById('quantity').value),
    price: parseFloat(document.getElementById('price').value),
    supplier: document.getElementById('supplier').value,
    minStockLevel: parseInt(document.getElementById('minStockLevel').value)
  };
  
  try {
    await ApiService.createItem(newItem);
    addItemForm.reset();
    addItemModal.hide();
    loadItems();
    // Refresh dashboard data if on dashboard
    if (currentView === 'dashboard') {
      loadDashboardData();
    }
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
    document.getElementById('editMinStockLevel').value = item.minStockLevel || 10;
    
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
    supplier: document.getElementById('editSupplier').value,
    minStockLevel: parseInt(document.getElementById('editMinStockLevel').value)
  };
  
  try {
    await ApiService.updateItem(itemId, updatedItem);
    editItemModal.hide();
    loadItems();
    // Refresh dashboard data if on dashboard
    if (currentView === 'dashboard') {
      loadDashboardData();
    }
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
    // Refresh dashboard data if on dashboard
    if (currentView === 'dashboard') {
      loadDashboardData();
    }
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