const EventEmitter = require("events")

const axios = require("axios")

const api = "http://imonke.gastrodon.io"

class Client extends EventEmitter {
    constructor(opts = {}) {
        super(opts)

        this._api = opts.api || api
        this._email = opts.email || null
        this._secret = opts.secret || null
        this._token = null
        this._token_expires = 0
    }

    get now() {
        return Math.round((new Date()).getTime() / 1000)
    }

    get api() {
        return this._api
    }

    get headers() {
        return (async () => {
            if (this._token != null && this._token_expires > this.now) {
                return {
                    "Authorization": `Bearer ${this._token}`
                }
            }

            if (this._secret == null || this._email == null) {
                return {}
            }

            let local_secret = this._secret
            this._secret = null

            try {
                await this.login({
                    secret: local_secret
                })
            } finally {
                return await this.headers
            }

        })()
    }

    async request(opts = {}) {
        let headers = opts.headers ? {
            ...(await this.header),
            ...opts.headers
        } : await this.headers
        return (await axios(opts)).data
    }

    async login(opts = {}) {
        let email = opts.email || this._email
        if (!email) {
            throw "email is required"
        }

        let data = {
            email,
        }

        let secret = opts.secret || this._secret
        if (secret) {
            data.secret = secret
        } else if (opts.password) {
            data.password = opts.password || null
        } else {
            throw "password or secret is required"
        }

        try {
            let response = await this.request({
                method: "POST",
                url: `${this.api}/auth`,
                data: data,
            })

            this._secret = response.auth.secret
            this._token = response.auth.token
            this._token_expires = response.auth.expires
            this.emit("login", true)
        } catch (err) {
            this._token = null
            this.emit("login", false)
        }
    }
}

module.exports = Client
