// API Service for Inventory Management System

// API base URL - update this with your backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// Item API endpoints
const API_ENDPOINTS = {
  ITEMS: `${API_BASE_URL}/items`,
  HADOOP_EXPORT: `${API_BASE_URL}/hadoop/export`,
  AUTH: `${API_BASE_URL}/auth`
};

// Error handler function
const handleErrors = (response) => {
  if (!response.ok) {
    return response.json().then(err => {
      throw new Error(err.message || 'An error occurred');
    });
  }
  return response.json();
};

// Get auth headers for authenticated requests
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// API Service object
const ApiService = {
  // Get all items
  getItems: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ITEMS, {
        headers: getAuthHeaders()
      });
      return handleErrors(response);
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },

  // Get a single item by ID
  getItem: async (id) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ITEMS}/${id}`, {
        headers: getAuthHeaders()
      });
      return handleErrors(response);
    } catch (error) {
      console.error(`Error fetching item ${id}:`, error);
      throw error;
    }
  },

  // Create a new item
  createItem: async (itemData) => {
    try {
      const response = await fetch(API_ENDPOINTS.ITEMS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(itemData),
      });
      return handleErrors(response);
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  // Update an existing item
  updateItem: async (id, itemData) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ITEMS}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(itemData),
      });
      return handleErrors(response);
    } catch (error) {
      console.error(`Error updating item ${id}:`, error);
      throw error;
    }
  },

  // Delete an item
  deleteItem: async (id) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ITEMS}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleErrors(response);
    } catch (error) {
      console.error(`Error deleting item ${id}:`, error);
      throw error;
    }
  },

  // Export data to Hadoop
  exportToHadoop: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.HADOOP_EXPORT, {
        headers: getAuthHeaders()
      });
      return handleErrors(response);
    } catch (error) {
      console.error('Error exporting to Hadoop:', error);
      throw error;
    }
  },
  
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/me`, {
        headers: getAuthHeaders()
      });
      return handleErrors(response);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
}; 