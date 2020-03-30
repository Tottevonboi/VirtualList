class Api {
    constructor() {
        this.basePath = "https://warm-plateau-84344.herokuapp.com/";
        this.loginNeeded = new Event("loginNeeded");
        this.token = getCookie("token");
        this.refreshToken = getCookie("refreshToken");
    }

    async GetIsAuthorized() {
        try {
            if (this.token) {
                if ((await this.ValidateToken()).message) {
                    return true;
                }
                else {
                    console.log("Refresh token has been used");
                    console.log(await this.UseRefreshToken());
                    return false;
                }
            }
            else {
                return false;
            }
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }

    async GetResponse(method, url, data = null) {
        var requestUrl = this.basePath + url;
        var token = this.token;
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open(method, requestUrl);
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            if (token) {
                xhr.setRequestHeader("Authorization", "bearer " + token);
            }
            if (data != null) {
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xhr.send(JSON.stringify(data));
            }
            else {
                xhr.send();
            }
        });
    }

    async GetUserLists() {
        var path = "user/lists";
        return JSON.parse(await this.GetResponse("GET", path));
    }

    async ValidateToken() {
        var path = "token/validate";
        return JSON.parse(await this.GetResponse("GET", path));
    }

    async UseRefreshToken() {
        var path = "user/token/refresh";
        return JSON.parse(await this.GetResponse("POST", path, { refreshToken: this.refreshToken }));
    }

    async Login(emailOrUsername, password) {
        var data = null;

        if (emailOrUsername.includes("@")) {
            data = { email: emailOrUsername, username: "", password: password };
        }
        else {
            data = { email: "", username: emailOrUsername, password: password };
        }

        var path = "user/token";
        return JSON.parse(await this.GetResponse("POST", path, data))
    }
}