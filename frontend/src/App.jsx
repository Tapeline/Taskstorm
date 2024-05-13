import './App.css'
import {Outlet} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";

function App() {
    return (
        <div className="container-fluid overflow-hidden">
            <div className="row vh-100 overflow-auto">
                <Navbar/>
                <div className="col-sm-9 p-3 min-vh-100" id="content">
                    <Outlet/>
                </div>
            </div>
        </div>
    );
}

export default App;
