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
    const [editItem, setEditItem] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = () => {
        fetch('https://team6project.onrender.com/api/inventory')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => setInventory(data))
            .catch(error => {
                console.error('Error fetching inventory:', error);
                showSnackbar('Failed to fetch inventory', 'error');
            });
    };

    const handleEdit = (item, event) => {
        event.stopPropagation();
        setEditItem({
            ...item,
            Price: parseFloat(item.Price) || 0,
            InventoryQuantity: parseInt(item.InventoryQuantity) || 0
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = (item, event) => {
        event.stopPropagation();
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    };

    const handleEditSubmit = async () => {
        try {
            const response = await fetch(`https://team6project.onrender.com/api/inventory/${editItem.ProductID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ProductName: editItem.ProductName,
                    Price: editItem.Price,
                    InventoryQuantity: editItem.InventoryQuantity
                })
            });

            if (!response.ok) throw new Error('Failed to update item');
            
            showSnackbar('Item updated successfully', 'success');
            fetchInventory();
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating item:', error);
            showSnackbar('Failed to update item', 'error');
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`https://team6project.onrender.com/api/inventory/${itemToDelete.ProductID}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete item');
            
            showSnackbar('Item deleted successfully', 'success');
            fetchInventory();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting item:', error);
            showSnackbar('Failed to delete item', 'error');
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
                            <IconButton onClick={(e) => handleEdit(item, e)} color="primary" size="small">
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={(e) => handleDelete(item, e)} color="error" size="small">
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <DialogTitle>Edit Item</DialogTitle>
                <DialogContent>
                    {editItem && (
                        <>
                            <TextField
                                label="Product Name"
                                fullWidth
                                margin="normal"
                                value={editItem.ProductName}
                                onChange={(e) => setEditItem({ ...editItem, ProductName: e.target.value })}
                            />
                            <TextField
                                label="Price"
                                type="number"
                                fullWidth
                                margin="normal"
                                value={editItem.Price}
                                onChange={(e) => setEditItem({ ...editItem, Price: parseFloat(e.target.value) })}
                            />
                            <TextField
                                label="Quantity"
                                type="number"
                                fullWidth
                                margin="normal"
                                value={editItem.InventoryQuantity}
                                onChange={(e) => setEditItem({ ...editItem, InventoryQuantity: parseInt(e.target.value) })}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSubmit} color="primary">Save</Button>
                </DialogActions>
            </Dialog>

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
