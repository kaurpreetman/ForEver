
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import ShopContextProvider from './context/ShopContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  
  <ShopContextProvider>
    <GoogleOAuthProvider clientId=''>
  <App />
  </GoogleOAuthProvider>
  </ShopContextProvider>
  
  </BrowserRouter>
   

  
)
