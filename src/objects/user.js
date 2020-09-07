const Monkething = require("./monkething")

class User extends Monkething {
    constructor(opts = {}) {
        super(opts)
        this._nick = opts.nick || null

        if (!(this._id || this._nick)) {
            throw "A user needs an id or nick"
        }

        this.route = this._id ? `/user/id/${this._id}` : `/user/nick/${this._nick}`
        this.key = "user"
    }

    get id() {
        return (async () => {
            if (!this._id) {
                this._id = await this.get("id")
                this.route = `/user/id/${this._id}`
            }

            return this._id
        })()
    }

    get nick() {
        return this.get("nick")
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
}

module.exports = User
