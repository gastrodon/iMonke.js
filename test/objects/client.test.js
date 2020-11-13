/**
 * @jest-environment node
 */

const Client = require("../../src/objects/client")

const email = "mail@gastrodon.io"
const password = "foobar2000"

jest.setTimeout(30000)

async function logged_client() {
    let client = new Client()

    await client.login({
        email,
        password
    })
    return client
}

function create_data(add_bio) {
    return {
        nick: `_test_${Math.random().toString(36).substring(2)}`,
        email: `_test_${Math.random().toString(36).substring(2)}@imonke.io`,
        bio: add_bio ? `Created at ${Date.now()} in jest` : null,
        password: "foobar2000",
    }
}

test("client constructs", async () => {
    expect(new Client()).not.toBeNull()
    expect((new Client()).api).not.toBeNull()

    expect((new Client())._email).toBeNull()
    expect((new Client())._secret).toBeNull()
    expect((new Client())._token).toBeNull()
})

test("client constructs with opts", async () => {
    let secret = "secret"
    expect((new Client({
        secret
    }))._secret).toBe(secret)
    expect((new Client({
        secret,
        email: "bar"
    }))._secret).toBe(secret)

    expect((new Client({
        email
    }))._email).toBe(email)
    expect((new Client({
        email,
        secret: "bar"
    }))._email).toBe(email)
})

test("now", async () => {
    let now = (new Client()).now
    let actual = (new Date()).getTime() / 1000
    expect(now).toBeCloseTo(actual, 0)
})

test("login password", async () => {
    let client = new Client({
        email,
    })
    expect(await client.login({
        password
    })).toBe(true)

    expect(client._secret).toBeTruthy()
    expect(client._token).toBeTruthy()
    expect(client._token_expires).toBeTruthy()
    expect((await client.headers).Authorization).toBe(`Bearer ${client._token}`)
})

test("login bad password", async () => {
    let client = new Client({
        email
    })
    let callback = jest.fn()
    client.on("login", callback)

    expect(await client.login({
        password: "Ah shit, here we go again"
    })).toBe(false)

    setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(false)
    }, 500)
})

test("login bad secret", async () => {
    let client = new Client({
        email
    })
    let callback = jest.fn()
    client.on("login", callback)

    expect(await client.login({
        secret: "You picked the wrong house fool"
    })).toBe(false)

    setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(false)
    }, 500)
})

test("login with jack and email", async () => {
    let client = new Client({
        email
    })

    expect(client.login()).rejects.toEqual("password or secret is required")
})

test("login with jack and shit", async () => {
    expect((new Client()).login()).rejects.toEqual("email is required")
})

test("login stored secret", async () => {
    let secreter = new Client({
        email
    })
    await secreter.login({
        password
    })


    let client = new Client({
        email,
        secret: secreter._secret
    })

    // Patch the `headers` getter
    // so that it doesn't auto rotate keys
    Object.defineProperty(client, "headers", {
        get: async () => {},
    })

    expect(await client.login()).toBe(true)

    expect(client._secret).toBeTruthy()
    expect(client._token).toBeTruthy()
    expect(client._token_expires).toBeTruthy()
})

test("login preserves email", async () => {
    let client = new Client()

    await client.login({
        email,
        password,
    })

    expect(client._email).toEqual(email)
})

test("create", async () => {
    let client = new Client()
    let data = create_data()
    expect(await client.create(data)).toBe(true)
    expect(await client.nick).toEqual(data.nick)
    expect(await client.email).toEqual(data.email)
})

test("create with bio", async () => {
    let client = new Client()
    let data = create_data(true)
    await client.create(data)
    expect(await client.bio).toBe(data.bio)
    expect(await client.bio).not.toBeUndefined()
    expect(await client.bio).not.toBeNull()
})

test("create without data", async () => {
    let client = new Client()
    expect(client.create()).rejects.not.toEqual(true)
})

test("create without nick", async () => {
    let client = new Client()
    expect(client.create({email: "bar", password: "bar"})).rejects.toEqual("nick is required")
})

test("create without email", async () => {
    let client = new Client()
    expect(client.create({nick: "bar", password: "bar"})).rejects.toEqual("email is required")
})

test("create without password", async () => {
    let client = new Client()
    expect(client.create({nick: "bar", email: "bar"})).rejects.toEqual("password is required")
})

test("create conflict nick", async () => {
    let data = create_data()
    await (new Client()).create(data)
    expect((new Client()).create({
        ...create_data(),
        nick: data.nick,
    })).rejects.toEqual(`nick ${data.nick} already taken`)
})

test("create conflict email", async () => {
    let data = create_data()
    await (new Client()).create(data)
    expect((new Client()).create({
        ...create_data(),
        email: data.email,
    })).rejects.toEqual(`email ${data.email} already taken`)
})

test("secret login", async () => {
    let client = new Client({
        email,
    })

    await client.login({
        password
    })

    let token = client._token
    let secret = client._secret

    client._secret = null
    expect(await client.login({
        secret
    })).toBe(true)

    expect(client._secret).toBeTruthy()
    expect(client._token).toBeTruthy()
    expect(client._token_expires).toBeTruthy()

    expect(client._token).not.toBe(token)
    expect(client._secret).not.toBe(secret)

    expect((await client.headers).Authorization).toBe(`Bearer ${client._token}`)
})

test("headers", async () => {
    let secret = "secret"
    let token = "token"

    let client = new Client({
        secret,
    })

    client._token = token
    client._token_expires = client.now + 60 * 60 * 24

    let headers = await client.headers
    expect(headers.Authorization).toBe(`Bearer ${client._token}`)
})

test("headers rotate when missing token", async () => {
    let client = new Client({
        email
    })
    await client.login({
        password
    })

    let secret = client._secret
    client._token = null

    await client.headers

    expect(client._secret).toBeTruthy()
    expect(client._token).toBeTruthy()
    expect(client._token_expires).toBeTruthy()
    expect(client._secret).not.toBe(secret)
})

test("headers rotate when expired token", async () => {
    let client = new Client({
        email
    })
    await client.login({
        password
    })

    let secret = client._secret
    let token = client._token
    client._token_expires = 0

    await client.headers

    expect(client._secret).toBeTruthy()
    expect(client._token).toBeTruthy()
    expect(client._token_expires).toBeTruthy()
    expect(client._secret).not.toBe(secret)
    expect(client._token).not.toBe(token)
})

test("data is fetched", async () => {
    let client = await logged_client()

    expect(Object.keys(await client.data)).not.toEqual(0)
})

test("data is fresh", async () => {
    let client = await logged_client()

    await client.data
    client._data.nick = "luger"

    expect((await client.fresh.data).nick).not.toEqual("luger")
})

test("data is got", async () => {
    let client = await logged_client()

    await client.data
    expect(client._data.nick).not.toBeFalsy()
    expect((await client.get("nick"))).toEqual((await client.data).nick)
})

test("data is freshly got", async () => {
    let client = await logged_client()

    await client.data
    client._data.nick = "something"

    expect(await client.fresh.get("nick")).not.toEqual("something")
})

test("data is updated if no data", async () => {
    let client = await logged_client()

    expect(await client.get("nick")).not.toBeFalsy()
})

test("data is updated if missing", async () => {
    let client = await logged_client()

    await client.data
    client._data.nick = undefined
    expect(await client.get("nick")).not.toEqual(undefined)
    expect(await client.get("nick")).not.toBeFalsy()
})

test("data is updated if missing and freshable", async () => {
    let client = await logged_client()

    await client.data
    client._data.nick = undefined
    expect(await client.get("nick", {
        freshable: true
    })).not.toEqual(undefined)
    expect(await client.get("nick", {
        freshable: true
    })).not.toBeFalsy()
})

test("data is not updated if not freshable", async () => {
    let client = await logged_client()

    await client.data
    client._data.nick = undefined
    expect(await client.get("nick", {
        freshable: false
    })).toEqual(undefined)
})

test("getter id", async () => {
    let client = await logged_client()

    expect(await client.id).not.toBeFalsy()
    expect(client._id).not.toBeFalsy()
    expect((await client.id).length).toEqual(36)
})

test("getter nick", async () => {
    let client = await logged_client()

    expect(await client.nick).not.toBeFalsy()
})

test("getter email", async () => {
    let client = await logged_client()

    expect(await client.email).toEqual(email)
})

test("getter bio", async () => {
    let client = await logged_client()

    expect(await client.bio).not.toBeNull()
    expect(await client.bio).not.toBeUndefined()
})

test("getter admin", async () => {
    let client = await logged_client()

    expect(await client.admin).not.toBeNull()
    expect(await client.admin).not.toBeUndefined()
})

test("getter moderator", async () => {
    let client = await logged_client()

    expect(await client.moderator).not.toBeNull()
    expect(await client.moderator).not.toBeUndefined()
})

test("getter created", async () => {
    let client = await logged_client()

    expect(await client.created).toBeLessThan(client.now)
    expect(await client.created).toBeGreaterThan(0)
})

test("getter post_count", async () => {
    let client = await logged_client()

    expect(await client.post_count).not.toBeNull()
    expect(await client.post_count).not.toBeUndefined()
})

test("getter subscriber_count", async () => {
    let client = await logged_client()

    expect(await client.subscriber_count).not.toBeNull()
    expect(await client.subscriber_count).not.toBeUndefined()
})

test("getter subscription_count", async () => {
    let client = await logged_client()

    expect(await client.subscription_count).not.toBeNull()
    expect(await client.subscription_count).not.toBeUndefined()
})

test("getter user", async () => {
    let client = await logged_client()

    expect(await (await client.user).id).toEqual(await client.id)
})

test("getter user not authed", async () => {
    let client = new Client()

    expect(client.user).rejects.toThrow()
})
