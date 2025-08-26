import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { OrdersProvider } from './context/OrdersContext.jsx'
import QRScanListener from './components/QRScanListener.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OrdersProvider>
      <QRScanListener />
      <App />
    </OrdersProvider>
  </StrictMode>,
)
