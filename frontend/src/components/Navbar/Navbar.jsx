import React, {useEffect, useState} from "react";
import NavbarLink from "./NavbarLink";
import taskstormWhiteLogo from "../../assets/taskstormWhiteLogo.png";
import NavbarProfileLink from "./NavbarProfileLink.jsx";

export default function Navbar() {
    const [logoComponent, setLogoComponent] = useState("");
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
            setLogoComponent(
                <div className="w-100 d-flex justify-content-center">
                    <img src={taskstormWhiteLogo} alt="Logo"
                         style={{width: "50%", paddingTop: "16px", paddingBottom: "32px"}}/>
                </div>
            );
        } else {
            navbar.setAttribute(
                'style',
                `height: 72px;`
            );
            content.setAttribute(
                'style',
                `padding-bottom: 80px!important;`
            );
            navbar.classList.add("fixed-bottom");
            setLogoComponent("");
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
            {logoComponent}
            <ul className="nav nav-pills flex-sm-column justify-content-between ps-sm-0 mb-auto">
                <NavbarLink linkTo="/workspaces" text=" Workspaces" icon="bi-house" />
                <NavbarLink linkTo="/local-settings" text=" Local settings" icon="bi-sliders" />
                <NavbarProfileLink/>
                <NavbarLink linkTo="/logout" text=" Logout" icon="bi-box-arrow-left"/>
            </ul>
        </div>
    );
}