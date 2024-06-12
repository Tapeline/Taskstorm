import React from "react";
import { NavLink } from "react-router-dom";
import ProfilePic from "../Misc/ProfilePic.jsx";

export default function NavbarProfileLink() {
    const pfp = localStorage.getItem("accountPfp");
    return (
        <li className="nav-item">
            <NavLink
                to="/profile/dashboard"
                className={({ isActive }) => {
                    return isActive
                        ? "nav-link link-light li-currentlink px-2"
                        : "nav-link link-light px-2";
                }}
            >
                {
                    pfp === "null"
                        ? <i className={"bi bi-person-circle"}></i>
                        : <ProfilePic url={pfp} size={16}/>
                }
                <p className="ms-1 d-none d-sm-inline"> Profile</p>
            </NavLink>
        </li>
    );
}
