import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Box,
    Chip
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const UserProfile = ({ user }) => {
    const getLoyaltyTier = (points) => {
        if (points >= 150) return { tier: 'Platinum', discount: 15, nextTier: null, pointsToNext: 0 };
        if (points >= 100) return { tier: 'Gold', discount: 10, nextTier: 'Platinum', pointsToNext: 150 - points };
        if (points >= 50) return { tier: 'Silver', discount: 5, nextTier: 'Gold', pointsToNext: 100 - points };
        return { tier: 'Bronze', discount: 0, nextTier: 'Silver', pointsToNext: 50 - points };
    };

    const loyaltyInfo = getLoyaltyTier(user.LoyaltyPoints || 0);
    const progress = (user.LoyaltyPoints || 0) % 50 / 50 * 100;

    return (
        <div className="profile-card">
            <Typography variant="h4" className="profile-header">
                Your Profile
            </Typography>

            <div className="loyalty-tier">
                <StarIcon className="loyalty-tier-icon" fontSize="large" />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" gutterBottom>
                        {loyaltyInfo.tier} Member
                    </Typography>
                    <Chip 
                        label={`${loyaltyInfo.discount}% Discount Available`}
                        color="primary"
                        sx={{ 
                            backgroundColor: '#ffd700',
                            color: '#333',
                            fontWeight: 'bold'
                        }}
                    />
                </Box>
            </div>

            <div className="loyalty-progress">
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {user.LoyaltyPoints || 0} Points
                    </Typography>
                    {loyaltyInfo.nextTier && (
                        <Typography variant="body2" color="textSecondary" sx={{ ml: 'auto' }}>
                            {loyaltyInfo.pointsToNext} points to {loyaltyInfo.nextTier}
                        </Typography>
                    )}
                </Box>

                {loyaltyInfo.nextTier && (
                    <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: '#ffd700'
                            }
                        }}
                    />
                )}
            </div>

            <div className="loyalty-benefits">
                <Typography variant="h6" gutterBottom>
                    Loyalty Program Benefits
                </Typography>
                <ul>
                    <li>Earn 10% of purchase price as loyalty points</li>
                    <li>Silver (50 points): 5% discount on all purchases</li>
                    <li>Gold (100 points): 10% discount on all purchases</li>
                    <li>Platinum (150 points): 15% discount on all purchases</li>
                </ul>
            </div>
        </div>
    );
};

export default UserProfile;
