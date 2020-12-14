const EventEmitter = require("events")
const axios = require("axios")

const api = "https://imonke.gastrodon.io"

class MonkeThing extends EventEmitter {
    constructor(opts = {}) {
        super(opts)

        this.client = opts.client || new(require("./client"))()

        this.route = null
        this.key = null

        this._api = opts.api || api
        this._id = opts.id || null
        this._data = opts.data || null
        this._fresh = false

    }

    get now() {
        return Math.round((new Date()).getTime() / 1000)
    }

    get api() {
        return this._api
    }

    get data() {
        return (async () => {
            if ((!this._data || this._fresh) && this.route && this.key) {
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

    get id() {
        return (async () => {
            return this._id
        })()
    }

    get fresh() {
        this._fresh = true
        return this
    }

    async request(opts = {}) {
        opts = {
            ...opts,
            headers: {
                ...(await this.client.headers),
                ...(opts.headers || {}),
            },
        }

        return (await axios(opts)).data
    }

    async get(name, opts = {}) {
        let freshable = opts.freshable === undefined ? true : opts.freshable
        let got = (await this.data)[name]

        if (got === undefined && freshable) {
            got = (await this.fresh.data)[name]
        }

        return got
    }
}

module.exports = MonkeThing
