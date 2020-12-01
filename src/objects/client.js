const FormData = require("form-data")
const MonkeThing = require("./monkething")

class Client extends MonkeThing {
    constructor(opts = {}) {
        super({
            client: {},
            ...opts,
        })
        this.client = this
        this.route = "/me"
        this.key = "user"

        this._email = opts.email || null
        this._secret = opts.secret || null
        this._token = null
        this._token_expires = 0

        this._created = null
        this._user = null
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

    get id() {
        return (async () => {
            if (!this._id) {
                this._id = await this.get("id")
            }

            return this._id
        })()
    }

    get created() {
        return (async () => {
            if (!this._created) {
                this._created = await this.get("created")
            }

            return this._created
        })()
    }

    get nick() {
        return this.get("nick")
    }

    get email() {
        return (async () => {
            return this._email
        })()
    }

    get bio() {
        return this.get("bio")
    }

    get admin() {
        return this.get("admin")
    }

    get moderator() {
        return this.get("moderator")
    }

    get post_count() {
        return this.get("post_count")
    }

    get subscriber_count() {
        return this.get("subscriber_count")
    }

    get subscription_count() {
        return this.get("subscription_count")
    }

    get user() {
        return (async () => {
            if (!this._user) {
                this._user = new (require("./user"))({id: await this.id})
            }

            return this._user
        })()
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

            this._email = email
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

    async create(opts = {}) {
        for (let key of ["nick", "email", "password"]) {
            if (!opts[key]) {
                throw `${key} is required`
            }
        }

        try {
            let response = await this.request({
                method: "POST",
                url: `${this.api}/user`,
                data: opts,
            })

            return await this.login({
                email: opts.email,
                password: opts.password,
            })
        } catch (err) {
            if (err.response.status === 409) {
                let key = err.response.data.key
                throw `${key} ${opts[key]} already taken`
            }
            return false
        }
    }

    async key_exists(key, value) {
        if (!key || !value) {
            return false
        }

        return (await this.request({
            method: "GET",
            url: `${this.api}/check/${key}/${value}`,
        })).exists
    }

    async nick_exists(nick) {
        return await this.key_exists("nick", nick)
    }

    async email_exists(email) {
        return await this.key_exists("email", email)
    }

    async upload_content(tags, featurable, nsfw, stream, size) {
        let form = new FormData()
        form.append("json", JSON.stringify({ tags, featurable, nsfw }), { contentType: "application/json" })
        form.append("file", stream, { knownLength: size })

        let response = await this.request({
            method: "POST",
            url: `${this.api}/content`,
            data: form,
            headers: { ...form.getHeaders(), "Content-Length": form.getLengthSync() },
        })
    }
}

module.exports = Client
