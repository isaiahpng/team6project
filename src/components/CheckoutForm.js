import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  CircularProgress
} from '@mui/material';

const CheckoutForm = ({ open, onClose, onSubmit, total, isProcessing }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || '';
      setFormData(prev => ({
        ...prev,
        [name]: formatted.slice(0, 19) // Limit to 16 digits + 3 spaces
      }));
      return;
    }

    // Format expiry date
    if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').match(/^(\d{0,2})(\d{0,2})/)
      if (formatted) {
        const [, month, year] = formatted;
        setFormData(prev => ({
          ...prev,
          [name]: month + (year ? `/${year}` : '')
        }));
      }
      return;
    }

    // Format CVV
    if (name === 'cvv') {
      setFormData(prev => ({
        ...prev,
        [name]: value.replace(/\D/g, '').slice(0, 3)
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Card number validation
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    // Expiry date validation
    const [month, year] = (formData.expiryDate || '').split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (!month || !year || !formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    } else if (parseInt(month) > 12 || parseInt(month) < 1) {
      newErrors.expiryDate = 'Invalid month';
    } else if (parseInt(year) < currentYear || 
              (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      newErrors.expiryDate = 'Card has expired';
    }

    // CVV validation
    if (!formData.cvv.match(/^\d{3}$/)) {
      newErrors.cvv = 'Please enter a valid 3-digit CVV';
    }

    // Other validations
    if (!formData.nameOnCard.trim()) {
      newErrors.nameOnCard = 'Please enter the name on card';
    }

    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = 'Please enter billing address';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Please enter city';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Please enter state';
    }

    if (!formData.zipCode.match(/^\d{5}$/)) {
      newErrors.zipCode = 'Please enter a valid 5-digit zip code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Checkout
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Total: ${total.toFixed(2)}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Card Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Card Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                error={!!errors.cardNumber}
                helperText={errors.cardNumber}
                placeholder="1234 5678 9012 3456"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                error={!!errors.expiryDate}
                helperText={errors.expiryDate}
                placeholder="MM/YY"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVV"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                error={!!errors.cvv}
                helperText={errors.cvv}
                type="password"
                placeholder="123"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name on Card"
                name="nameOnCard"
                value={formData.nameOnCard}
                onChange={handleChange}
                error={!!errors.nameOnCard}
                helperText={errors.nameOnCard}
              />
            </Grid>

            {/* Billing Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Billing Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Billing Address"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleChange}
                error={!!errors.billingAddress}
                helperText={errors.billingAddress}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={!!errors.city}
                helperText={errors.city}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={!!errors.state}
                helperText={errors.state}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                error={!!errors.zipCode}
                helperText={errors.zipCode}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <CircularProgress size={24} color="inherit" />
                &nbsp;Processing...
              </>
            ) : (
              'Place Order'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CheckoutForm;
