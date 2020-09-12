const MonkeThing = require("./monkething")

class Content extends MonkeThing {
    constructor(opts = {}) {
        super(opts)

        this.route = `/content/${this._id}`
        this.key = "content"
    }

    get author() {
        return (async () => {
            let User = require("./user")
            return new User({
                client: this.client,
                id: await this.get("author"),
            })
        })()
    }

    get created() {
        return this.get("created")
    }

    get tags() {
        return this.get("tags")
    }

    get file_url() {
        return this.get("file_url")
    }

    get mime() {
        return this.get("mime")
    }

    get comment_count() {
        return this.get("comment_count")
    }

    get like_count() {
        return this.get("like_count")
    }

    get dislike_count() {
        return this.get("dislike_count")
    }

    get repub_count() {
        return this.get("repub_count")
    }

    get view_count() {
        return this.get("view_count")
    }

    get featurable() {
        return this.get("featurable")
    }

    get featured() {
        return this.get("featured")
    }

    get nsfw() {
        return this.get("nsfw")
    }

    get removed() {
        return this.get("removed")
    }
}

module.exports = Content
