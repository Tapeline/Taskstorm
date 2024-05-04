import {toast} from "react-toastify";

export function toastError(message) {
    toast(<p>{message}</p>, {
        autoClose: 3000,
        type: "error"
    });
}
