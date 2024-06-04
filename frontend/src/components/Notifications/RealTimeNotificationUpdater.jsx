import React from "react";
import {getAllUnreadNotifications} from "../../api/endpoints-profile.jsx";
import {toastNotification} from "../../ui/toasts.jsx";

export default function RealTimeNotificationUpdater() {
    const accessToken = localStorage.getItem("accessToken");

    setInterval(() => {
        getAllUnreadNotifications(accessToken).then(response => {
            if (!response.success) return;
            let shown = localStorage.getItem("shownNotifications");
            if (shown === undefined || shown === null) shown = "[]";
            shown = JSON.parse(shown);

            response.data?.map(value => {
                if (shown.includes(value.id)) return;
                const issue_time = new Date(value.issue_time);
                const time_diff = Math.floor(Math.abs(issue_time - Date.now()) / 1000);
                if (time_diff < 2000) toastNotification(value.message);
                shown.push(value.id);
            })

            localStorage.setItem("shownNotifications", JSON.stringify(shown));
        })
    }, 20000);
}
