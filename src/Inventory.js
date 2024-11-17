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

const Inventory = () => {
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
            const response = await fetch('http://localhost:3001/api/inventory');
            if (!response.ok) {
                throw new Error('Failed to fetch inventory');
            }
            const data = await response.json();
            setInventory(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setSnackbar({
                open: true,
                message: 'Failed to fetch inventory',
                severity: 'error'
            });
        }
    };

    const handleEdit = (item) => {
        setEditingItem({ ...item });
    };

    const handleEditChange = (e) => {
        const { name, value, type } = e.target;
        let processedValue = value;

        // Convert numeric inputs to numbers
        if (type === 'number') {
            processedValue = value === '' ? '' : Number(value);
        }

        setEditingItem(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3001/api/inventory/${editingItem.ProductID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editingItem)
            });

            if (!response.ok) {
                throw new Error('Failed to update item');
            }

            const data = await response.json();
            setInventory(inventory.map(item => 
                item.ProductID === editingItem.ProductID ? {...item, ...editingItem} : item
            ));
            setEditingItem(null);
            setSuccess('Item updated successfully!');
        } catch (err) {
            console.error('Error updating item:', err);
            setError(err.message || 'Error updating item');
        }
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/inventory/${itemToDelete.ProductID}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete item');
            }

            setInventory(inventory.filter(item => item.ProductID !== itemToDelete.ProductID));
            setSuccess('Item deleted successfully!');
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        } catch (err) {
            console.error('Error deleting item:', err);
            setError(err.message || 'Error deleting item');
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <div className="inventory-container">
            <div className="inventory-list">
                {inventory.map((item) => (
                    <div key={item.ProductID} className="inventory-item">
                        <div className="item-details">
                            <h3>{item.ProductName}</h3>
                            <p>{item.ProductDescription}</p>
                            <p>Quantity: {item.InventoryQuantity}</p>
                            <p>Price: ${item.Price}</p>
                            <p>Tag: {item.Tag}</p>
                        </div>
                        <div className="item-actions">
                            <IconButton onClick={() => handleEdit(item)} color="primary">
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(item)} color="error">
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingItem} onClose={() => setEditingItem(null)}>
                <DialogTitle>Edit Item</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Product Name"
                        name="ProductName"
                        value={editingItem?.ProductName || ''}
                        onChange={handleEditChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description"
                        name="ProductDescription"
                        value={editingItem?.ProductDescription || ''}
                        onChange={handleEditChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Quantity"
                        name="InventoryQuantity"
                        type="number"
                        value={editingItem?.InventoryQuantity || ''}
                        onChange={handleEditChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Price"
                        name="Price"
                        type="number"
                        value={editingItem?.Price || ''}
                        onChange={handleEditChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Tag"
                        name="Tag"
                        value={editingItem?.Tag || ''}
                        onChange={handleEditChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingItem(null)}>Cancel</Button>
                    <Button onClick={handleEditSubmit} variant="contained" color="primary">
                        Save
                    </Button>
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
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    elevation={6}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Inventory;
