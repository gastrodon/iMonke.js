/**
 * @jest-environment node
 */

const Content = require("../../src/objects/content")
const id = "afa0f9fe-6261-44e9-a49b-31da7d6dee48"
const post_data = {
    id: id,
    author: "39f7edec-945b-4e71-88fd-cea5b298ff75",
    file_url: "http://file.gastrodon.io/foobar",
    created: 1599356556,
    comment_count: 5,
    like_count: 11,
    dislike_count: 15,
    repub_count: 2,
    view_count: 7,
    featurable: true,
    featured: false,
    nsfw: false,
    removed: false,
    mime: "image/jpg",
    tags: [],
}

jest.setTimeout(30000)

function get_content () {
    return new Content({data: post_data})
}

test("content from id", async () => {
    let content = new Content({id})

    expect(await content.id).toEqual(id)
})

test("author from content", async () => {
    let content = new Content({id})

    expect(await (await content.author).id).toEqual((await content.data).author)
})

test("getter created", async () => {
    expect(await get_content().created).not.toBeNull()
    expect(await get_content().created).not.toBeUndefined()
    expect(await get_content().created).toBeGreaterThan(0)
})

test("getter tags", async () => {
    expect(Array.isArray(await get_content().tags)).toEqual(true)
    expect(await get_content().tags).toEqual([])
})

test("getter file_url", async () => {
    expect(await get_content().file_url).not.toBeNull()
    expect(await get_content().file_url).not.toBeUndefined()
})

test("getter mime", async () => {
    expect(await get_content().mime).not.toBeNull()
    expect(await get_content().mime).not.toBeUndefined()
})

test("getter comment_count", async () => {
    expect(await get_content().comment_count).not.toBeNull()
    expect(await get_content().comment_count).not.toBeUndefined()
})

test("getter like_count", async () => {
    expect(await get_content().like_count).not.toBeNull()
    expect(await get_content().like_count).not.toBeUndefined()
})

test("getter dislike_count", async () => {
    expect(await get_content().dislike_count).not.toBeNull()
    expect(await get_content().dislike_count).not.toBeUndefined()
})

test("getter repub_count", async () => {
    expect(await get_content().repub_count).not.toBeNull()
    expect(await get_content().repub_count).not.toBeUndefined()
})

test("getter view_count", async () => {
    expect(await get_content().view_count).not.toBeNull()
    expect(await get_content().view_count).not.toBeUndefined()
})

test("getter featurable", async () => {
    expect(await get_content().featurable).not.toBeNull()
    expect(await get_content().featurable).not.toBeUndefined()
})

test("getter featured", async () => {
    expect(await get_content().featured).not.toBeNull()
    expect(await get_content().featured).not.toBeUndefined()
})

test("getter nsfw", async () => {
    expect(await get_content().nsfw).not.toBeNull()
    expect(await get_content().nsfw).not.toBeUndefined()
})

test("getter removed", async () => {
    expect(await get_content().removed).not.toBeNull()
    expect(await get_content().removed).not.toBeUndefined()
})
