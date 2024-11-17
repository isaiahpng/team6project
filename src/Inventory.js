import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    Snackbar,
    Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const InventoryDashboard = ({ addToCart }) => {
    const [inventory, setInventory] = useState([]);
    const [sortOption, setSortOption] = useState('quantityAsc');
    const [editingItem, setEditingItem] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await fetch('https://team6project.onrender.com/api/inventory');
            if (!response.ok) {
                throw new Error('Failed to fetch inventory');
            }
            const data = await response.json();
            setInventory(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setError('Failed to fetch inventory');
        }
    };

    const handleEdit = (item) => {
        setEditingItem({ ...item });
        setError('');
        setSuccess('');
    };

    const handleEditChange = (e) => {
        const { name, value, type } = e.target;
        let processedValue = value;

        if (type === 'number') {
            processedValue = value === '' ? '' : Number(value);
        }

        setEditingItem({
            ...editingItem,
            [name]: processedValue
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate inputs
        if (!editingItem.ProductName) {
            setError('Product name is required');
            return;
        }

        if (editingItem.InventoryQuantity === '' || isNaN(editingItem.InventoryQuantity)) {
            setError('Valid quantity is required');
            return;
        }

        if (editingItem.Price === '' || isNaN(editingItem.Price)) {
            setError('Valid price is required');
            return;
        }

        try {
            const formData = {
                ...editingItem,
                InventoryQuantity: parseInt(editingItem.InventoryQuantity),
                Price: parseFloat(editingItem.Price)
            };

            console.log('Updating inventory item:', formData);

            const response = await fetch(`https://team6project.onrender.com/api/inventory/${editingItem.ProductID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            let data;
            try {
                data = await response.json();
            } catch (err) {
                console.error('Error parsing response:', err);
                throw new Error('Invalid server response');
            }

            console.log('Server response:', data);

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to update item');
            }

            setSuccess('Item updated successfully!');
            setEditingItem(null);
            fetchInventory();
        } catch (error) {
            console.error('Error updating item:', error);
            setError(error.message || 'Failed to update item');
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            const response = await fetch(`https://team6project.onrender.com/api/inventory/${productId}`, {
                method: 'DELETE'
            });

            let data;
            try {
                data = await response.json();
            } catch (err) {
                console.error('Error parsing response:', err);
                throw new Error('Invalid server response');
            }

            console.log('Server response:', data);

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to delete item');
            }

            setSuccess('Item deleted successfully!');
            fetchInventory();
        } catch (error) {
            console.error('Error deleting item:', error);
            setError(error.message || 'Failed to delete item');
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`https://team6project.onrender.com/api/inventory/${itemToDelete.ProductID}`, {
                method: 'DELETE'
            });

            let data;
            try {
                data = await response.json();
            } catch (err) {
                console.error('Error parsing response:', err);
                throw new Error('Invalid server response');
            }

            console.log('Server response:', data);

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to delete item');
            }

            setSuccess('Item deleted successfully!');
            fetchInventory();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting item:', error);
            setError(error.message || 'Failed to delete item');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const sortInventory = () => {
        let sortedInventory = [...inventory];
        switch (sortOption) {
            case 'quantityAsc':
                sortedInventory.sort((a, b) => a.InventoryQuantity - b.InventoryQuantity);
                break;
            case 'quantityDesc':
                sortedInventory.sort((a, b) => b.InventoryQuantity - a.InventoryQuantity);
                break;
            case 'priceAsc':
                sortedInventory.sort((a, b) => a.Price - b.Price);
                break;
            case 'priceDesc':
                sortedInventory.sort((a, b) => b.Price - a.Price);
                break;
            default:
                break;
        }
        return sortedInventory;
    };

    return (
        <div className="inventory-container">
            <div className="sort-controls">
                <label htmlFor="sort">Sort by: </label>
                <select
                    id="sort"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="quantityAsc">Quantity: Low to High</option>
                    <option value="quantityDesc">Quantity: High to Low</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                </select>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="inventory-grid">
                {sortInventory().map(item => (
                    <div className="inventory-item" key={item.ProductID}>
                        <div className="item-content" onClick={() => addToCart(item)}>
                            <h3 className="product-name">{item.ProductName}</h3>
                            <p className="product-price">${item.Price.toFixed(2)}</p>
                            <p className="product-quantity">Quantity: {item.InventoryQuantity}</p>
                            {item.InventoryQuantity < 20 && (
                                <p className="low-stock-warning">Low Stock</p>
                            )}
                        </div>
                        <div className="item-actions">
                            <IconButton onClick={() => handleEdit(item)} color="primary" size="small">
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => {
                                setItemToDelete(item);
                                setIsDeleteDialogOpen(true);
                            }} color="error" size="small">
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    </div>
                ))}
            </div>

            {editingItem ? (
                <div className="edit-form">
                    <h3>Edit Item</h3>
                    <form onSubmit={handleEditSubmit}>
                        <div>
                            <label>Product Name:</label>
                            <input
                                type="text"
                                name="ProductName"
                                value={editingItem.ProductName}
                                onChange={handleEditChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Description:</label>
                            <textarea
                                name="ProductDescription"
                                value={editingItem.ProductDescription || ''}
                                onChange={handleEditChange}
                                rows="4"
                                placeholder="Enter product description"
                                style={{ width: '100%', minHeight: '100px', padding: '8px' }}
                            />
                        </div>
                        <div>
                            <label>Quantity:</label>
                            <input
                                type="number"
                                name="InventoryQuantity"
                                value={editingItem.InventoryQuantity}
                                onChange={handleEditChange}
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <label>Price:</label>
                            <input
                                type="number"
                                name="Price"
                                value={editingItem.Price}
                                onChange={handleEditChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label>Tag:</label>
                            <input
                                type="text"
                                name="Tag"
                                value={editingItem.Tag || ''}
                                onChange={handleEditChange}
                            />
                        </div>
                        <div>
                            <label>Image URL:</label>
                            <input
                                type="text"
                                name="imageUrl"
                                value={editingItem.imageUrl || ''}
                                onChange={handleEditChange}
                            />
                        </div>
                        <div className="button-group">
                            <button type="submit">Save Changes</button>
                            <button type="button" onClick={() => setEditingItem(null)}>Cancel</button>
                        </div>
                    </form>
                </div>
            ) : (
                <></>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete {itemToDelete?.ProductName}?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default InventoryDashboard;
