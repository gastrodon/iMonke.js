const EventEmitter = require("events")

const axios = require("axios")

const api = "http://imonke.gastrodon.io"

class Client extends EventEmitter {
    route = "/me"
    key = "user"

    constructor(opts = {}) {
        super(opts)

        this._api = opts.api || api
        this._email = opts.email || null
        this._secret = opts.secret || null

        this._id = null
        this._data = null
        this._fresh = false
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

    get fresh() {
        this._fresh = true
        return this
    }

    get data() {
        return (async () => {
            if (!this._data || this._fresh) {
                let response = await this.request({
                    method: "GET",
                    url: `${this.api}${this.route}`,
                })

                this._data = response[this.key] || null
                this._fresh = false
            }

            return this._data
        })()
    }

    get id () {
        return (async () => {
            if (!this._id) {
                this._id = await this.get("id")
            }

            return this._id
        })()
    }

    get nick () {
        return this.get("nick")
    }

    get email () {
        return this.get("email")
    }

    get bio () {
        return this.get("bio")
    }

    get admin () {
        return this.get("admin")
    }

    get moderator() {
        return this.get("moderator")
    }

    get created () {
        return this.get("created")
    }

    get post_count () {
        return this.get("post_count")
    }

    get subscriber_count () {
        return this.get("subscriber_count")
    }

    get subscription_count () {
        return this.get("subscription_count")
    }

    async get(name, opts) {
        opts = opts || {}
        let freshable = opts.freshable === undefined ? true : opts.freshable
        let got = (await this.data)[name]

        if (got === undefined && freshable) {
            got = (await this.fresh.data)[name]
        }

        return got
    }

    async request(opts = {}) {
        opts = {
            headers: {...(await this.headers), ...(opts.headers || {})},
            validateStatus: null,
            ...opts,
        }

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

        let ok
        try {
            let response = await this.request({
                method: "POST",
                url: `${this.api}/auth`,
                data: data,
            })

            this._secret = response.auth.secret
            this._token = response.auth.token
            this._token_expires = response.auth.expires
            ok = true
        } catch (err) {
            ok = false
        } finally {
            this.emit("login", ok)
        }

        return ok
    }
}

module.exports = Client
