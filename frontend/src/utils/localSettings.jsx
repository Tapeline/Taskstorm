export function getBoolSetting(key) {
    return localStorage.getItem("ls_" + key) === "true";
}

export function setBoolSetting(key, value) {
    return localStorage.setItem("ls_" + key, (value === true).toString());
}

export const localSettings = {
    getBool: getBoolSetting,
    setBool: setBoolSetting
};
