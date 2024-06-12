const appStorage = {
    saveUserData: (data) => {
        localStorage.setItem("accountUsername", data.username);
        localStorage.setItem("accountId", data.id);
        localStorage.setItem("accountPfp", data.profile_pic);
    }
}

export default appStorage;
