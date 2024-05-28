import React from "react";
import {dateConverter} from "../../utils/time.jsx";

export default function NotificationCard(props) {
    const {notification} = props;

    return (
        <div className="list-group-item d-flex gap-3 py-3">
            <i className="bi bi-bell-fill"></i>
            <div>
                <div>
                    <p className="mb-0 opacity-75">{notification.message}</p>
                </div>
                <small className="opacity-50 text-nowrap">{dateConverter(notification.issue_time)}</small>
            </div>
        </div>
    );
}
