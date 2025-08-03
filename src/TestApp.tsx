import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config/api';

const TestApp: React.FC = () => {
    const [apiStatus, setApiStatus] = useState('checking...');

    useEffect(() => {
        console.log('🧪 Test App mounted successfully!');

        // Test backend connection
        const checkAPI = async () => {
            try {
                console.log('🔗 Testing backend connection...');
                const response = await fetch(`${API_BASE_URL}/api/health`);
                const data = await response.json();
                console.log('✅ Backend response:', data);
                setApiStatus('✅ Connected');
            } catch (error) {
                console.error('❌ Backend connection failed:', error);
                setApiStatus('❌ Failed');
            }
        };

        checkAPI();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>🧪 Frontend Test Page</h1>
            <p>If you can see this, React is working!</p>
            <p>Check the console for backend connection test results.</p>
            <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
                <strong>Environment:</strong>
                <br />
                API URL: {`${API_BASE_URL}/api`}
                <br />
                API Status: {apiStatus}
                <br />
                Mode: {import.meta.env.MODE}
                <br />
                Dev: {import.meta.env.DEV ? 'true' : 'false'}
            </div>
        </div>
    );
};

export default TestApp;
