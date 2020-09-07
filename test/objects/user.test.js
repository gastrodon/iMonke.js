/**
 * @jest-environment node
 */

const nick = "zero"
const User = require("../../src/objects/user")

jest.setTimeout(30000)

test("route from nick", async () => {
    let user = new User({nick})

    expect(user.route).toEqual(`/user/nick/${nick}`)
})

test("route from id", async () => {
    let id = await (new User({nick})).id
    let user = new User({id})

    expect(user.route).toEqual(`/user/id/${await user.id}`)
})

test("route is adjusted", async () => {
    let user = new User({nick})
    let id = await user.id

    expect(id).toBeTruthy()
    expect(id.length).toEqual(36)
    expect(user.route).toEqual(`/user/id/${id}`)
})

test("data is fetched", async () => {
    let id = await (new User({nick})).id
    let user = new User({id})
    let data = await user.data

    expect(data).not.toBeNull()
    expect(data).not.toBeUndefined()
    expect(data.id).toBeTruthy()
})

test("data is fetched from nick", async () => {
    let user = new User({nick})
    let data = await user.data

    expect(data).not.toBeNull()
    expect(data).not.toBeUndefined()
    expect(data.id).toBeTruthy()
})

test("constructor incomplete fails", async () => {
    expect(() => {new User()}).toThrow("A user needs an id or nick")
})

test("getter id", async () => {
    let client = new User({nick})

    expect(await client.id).not.toBeFalsy()
    expect(client._id).not.toBeFalsy()
    expect((await client.id).length).toEqual(36)
})


test("getter nick", async () => {
    let client = new User({nick})

    expect(await client.nick).not.toBeFalsy()
})

test("getter bio", async () => {
    let client = new User({nick})

    expect(await client.bio).not.toBeNull()
    expect(await client.bio).not.toBeUndefined()
})

test("getter admin", async () => {
    let client = new User({nick})

    expect(await client.admin).not.toBeNull()
    expect(await client.admin).not.toBeUndefined()
})

test("getter moderator", async () => {
    let client = new User({nick})

    expect(await client.moderator).not.toBeNull()
    expect(await client.moderator).not.toBeUndefined()
})

test("getter post_count", async () => {
    let client = new User({nick})

    expect(await client.post_count).not.toBeNull()
    expect(await client.post_count).not.toBeUndefined()
})

test("getter subscriber_count", async () => {
    let client = new User({nick})

    expect(await client.subscriber_count).not.toBeNull()
    expect(await client.subscriber_count).not.toBeUndefined()
})

test("getter subscription_count", async () => {
    let client = new User({nick})

    expect(await client.subscription_count).not.toBeNull()
    expect(await client.subscription_count).not.toBeUndefined()
})
