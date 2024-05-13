import React, { useEffect } from "react";
import NavbarLink from "./NavbarLink";

export default function Navbar() {
    const handleResize = () => {
        const navbar = document.getElementById("navbar");
        const content = document.getElementById("content");
        if (window.innerWidth >= 576) {
            navbar.setAttribute(
                'style',
                `width: 20%;
                 height: 100vh;
                 position: fixed;
                 z-index: 1;
                 left: 0;
                 top: 0;
                 height: 100%;`
            );
            content.setAttribute(
                'style',
                `padding-left: 21%!important; width: 100%!important;`
            );
            navbar.classList.remove("fixed-bottom");
        } else {
            navbar.removeAttribute("style")
            content.removeAttribute("style")
            navbar.classList.add("fixed-bottom");
        }
    }

    useEffect(() => {
        handleResize();
    }, []);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="col p-3" id="navbar">
            <ul className="nav nav-pills flex-sm-column justify-content-between ps-sm-0 mb-auto">
                <NavbarLink linkTo="/workspaces" text=" Workspaces" icon="bi-house" />
                <NavbarLink linkTo="/local-settings" text=" Local settings" icon="bi-sliders" />
                <NavbarLink linkTo="/profile/dashboard" text=" Profile" icon="bi-person-circle" />
            </ul>
        </div>
    );
}