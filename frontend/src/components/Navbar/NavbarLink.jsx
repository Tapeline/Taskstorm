import React from "react";
import { NavLink } from "react-router-dom";

export default function NavbarLink(props) {
    const { linkTo, text, icon } = props;

    return (
        <li className="nav-item">
            <NavLink
                to={linkTo}
                className={({ isActive }) => {
                    return isActive
                        ? "nav-link link-light li-currentlink px-2"
                        : "nav-link link-light px-2";
                }}
            >
                <i className={"bi icons " + icon}></i>
                <p className="ms-1 d-none d-sm-inline">{text}</p>
            </NavLink>
        </li>
    );
}
