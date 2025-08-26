import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { routes } from './utils/constants'
import Menu from './pages/Menu.jsx'
import OrdersState from './pages/OrdersState.jsx'
import Orders from './pages/Orders.jsx'
import History from './pages/History.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path={routes.menu} element={<Menu />} />
        <Route path={routes.ordersstate} element={<OrdersState />} />
        <Route path={routes.orders} element={<Orders />} />
        <Route path={routes.history} element={<History />} />
      </Routes>
    </Router>
  )
}

export default App;