import {toast} from "react-toastify";

export function toastError(message) {
    toast(<p>{message}</p>, {
        autoClose: 3000,
        type: "error"
    });
}

export function toastNotification(message) {
    if (message.length > 30) message = message.substring(0, 30) + "...";
    toast(<p>{message}</p>, {
        autoClose: 4000,
        type: "info"
    });
}

export function toastSuccess(message) {
    toast(<p>{message}</p>, {
        autoClose: 3000,
        type: "success"
    });
}
