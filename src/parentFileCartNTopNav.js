// ParentComponent.js
import React, { useState } from 'react';
import TopNav from './TopNav';
import RightCart from './RightCart';

const ParentComponent = () => {
    const [user, setUser] = useState(null); // or your userID logic
    const [cart, setCart] = useState([]);

    const handleLogin = (userID) => {
        setUser(userID);
    };

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <div>
            <TopNav user={user} onLogin={handleLogin} onLogout={handleLogout} />
            <RightCart cart={cart} setCart={setCart} userID={user?.userID} /> {/* Pass userID to RightCart */}
        </div>
    );
};

export default ParentComponent;