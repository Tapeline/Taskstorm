import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";


const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>
    },
    {
        path: "/login",
        element: <LoginPage/>
    },
    {
        path: "/register",
        element: <RegisterPage/>
    },
    {
        path: "/profile/:page",
        element: <ProfilePage/>
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router}></RouterProvider>

        <ToastContainer
            position="bottom-right"
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={true}
            rtl={false}
            pauseOnHover={true}
            draggable={false}
            theme="colored"
        />
    </React.StrictMode>,
);

