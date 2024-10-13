import React, { useEffect, useState } from 'react';
import Navbar from './navbar';
import './App.css';

function App() {
  const [schema, setSchema] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/schema')
      .then(response => response.json())
      .then(data => setSchema(data))
      .catch(err => console.error('Error fetching schema:', err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
      <Navbar />
      </header>
    </div>
  );
}

export default App;

