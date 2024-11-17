const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
    apiBaseUrl: isDevelopment 
        ? 'http://localhost:3001/api'
        : 'https://team6project.onrender.com/api'
};

export default config;
