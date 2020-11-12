/**
 * @jest-environment node
 */

const Feed = require("../../src/objects/feed")

jest.setTimeout(30000)

function all_feed() {
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
    let feed = all_feed()
    expect((await feed.get()).length).not.toEqual(0)
    expect((await feed.get()).length).not.toBeNull()
    expect((await feed.get()).length).not.toBeUndefined()
})

test("get content size", async () => {
    let feed = all_feed()
    expect((await feed.get({size: 5})).length).toEqual(5)
})

test("get content before", async () => {
    let offset = 5
    let size = 10
    let feed = all_feed()
    let first = await feed.get({size})
    let second = await feed.get({size, before: await first[offset].id})

    let index = 0
    for (let content of first.slice(offset+1)) {
        expect(await content.id).toEqual(await second[index++].id)
    }
})

test("content generator", async () => {
    let feed = new Feed({
        feed: "all",
        paginated_size: 3,
    })

    let limit = 20
    let prev = { created: 0 }
    for await (it of feed.content) {
        if (!limit--) {
            break
        }

        expect(await prev.created).toBeLessThanOrEqual(await it.created)
        it = prev
    }
})
