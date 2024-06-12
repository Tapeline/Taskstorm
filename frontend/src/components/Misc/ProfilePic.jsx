import React from "react";

export default function ProfilePic(props) {
    let {url, size, square} = props;
    if (size === undefined) size = 24;
    if (square === undefined) square = false;
    if (url === null || url === undefined || url === "null")
        return <i className={"bi bi-person-circle"} style={{fontSize: `${size}px`}}></i>;
    return <img src={url} alt="Profile picture" style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: square ? 0 : `${size}px`
    }}/>
}
