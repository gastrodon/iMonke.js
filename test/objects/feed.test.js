/**
 * @jest-environment node
 */

const Feed = require("../../src/objects/feed")

jest.setTimeout(30000)

function new_feed() {
    return new Feed({feed: "all"})
}

test("create feed", async () => {
    expect(new Feed({feed: "all"})).not.toBeFalsy()
})

test("create feed throws without feed", async () => {
    expect(() => {
        new Feed()
    }).toThrow()
})

test("get content", async () => {
    let feed = new_feed()
    expect((await feed.get()).length).not.toEqual(0)
    expect((await feed.get()).length).not.toBeNull()
    expect((await feed.get()).length).not.toBeUndefined()
})

test("get content size", async () => {
    let feed = new_feed()
    expect((await feed.get({size: 5})).length).toEqual(5)
})

test("content generator", async () => {
    let feed = new Feed({
        feed: "all",
        paginated_size: 3,
    })

    let limit = 20
    let last = {created: 2 ** 64}
    for await (it of feed.content) {
        if (!limit--) {
            break
        }

        expect(await it.created).toBeLessThanOrEqual(await last.created)
        last = await it
    }
})
