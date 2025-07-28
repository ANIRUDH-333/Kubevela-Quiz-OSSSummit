import React from 'react'
import ReactDOM from 'react-dom/client'
// Ensure the path is correct and the file exists
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
