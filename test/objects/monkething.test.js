/**
 * @jest-environment node
 */

const MonkeThing = require("../../src/objects/monkething")

jest.setTimeout(30000)

test("getter id", async () => {
    let id = "foobar"
    let thing = new MonkeThing({
        id
    })

    expect(await thing.id).toEqual(id)
})

test("data is set and got", async () => {
    let data = {
        foo: "bar"
    }
    let thing = new MonkeThing({
        data
    })

    expect(await thing.get("foo")).toEqual(data.foo)
})

test("MonkeThing constructs", async () => {
    let thing = new MonkeThing()

    expect(thing.client).not.toBeNull
    expect(thing.client).not.toBeUndefined
    expect(thing.route).toBeNull
    expect(thing.key).toBeNull
    expect(thing.api).not.toBeNull
    expect(thing.api).not.toBeUndefined
})
