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
import WorkspaceListPage from "./pages/WorkspaceListPage/WorkspaceListPage.jsx";
import WorkspaceDetailPage from "./pages/WorkspaceDetailPage/WorkspaceDetailPage.jsx";
import TaskDetailPage from "./pages/TaskDetailPage/TaskDetailPage.jsx";
import LoginRequiredRoute from "./utils/LoginRequiredRoute.jsx";
import LogoutPage from "./pages/LogoutPage/LogoutPage.jsx";
import LocalSettingsPage from "./pages/LocalSettingsPage/LocalSettingsPage.jsx";


const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
        children: [
            {
                path: "/profile",
                element: <LoginRequiredRoute><ProfilePage/></LoginRequiredRoute>
            },
            {
                path: "/profile/:page",
                element: <LoginRequiredRoute><ProfilePage/></LoginRequiredRoute>
            },
            {
                path: "/workspaces",
                element: <LoginRequiredRoute><WorkspaceListPage/></LoginRequiredRoute>
            },
            {
                path: "/workspaces/:workspaceId",
                element: <LoginRequiredRoute><WorkspaceDetailPage/></LoginRequiredRoute>
            },
            {
                path: "/workspaces/:workspaceId/:page",
                element: <LoginRequiredRoute><WorkspaceDetailPage/></LoginRequiredRoute>
            },
            {
                path: "/workspaces/:workspaceId/tasks/:taskId",
                element: <LoginRequiredRoute><TaskDetailPage/></LoginRequiredRoute>
            },
            {
                path: "/local-settings",
                element: <LoginRequiredRoute><LocalSettingsPage/></LoginRequiredRoute>
            },
        ]
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
        path: "/logout",
        element: <LogoutPage/>
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"/>

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

