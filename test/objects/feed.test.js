/**
 * @jest-environment node
 */

const Feed = require("../../src/objects/feed")

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
