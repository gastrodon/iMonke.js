/**
 * @jest-environment node
 */

const Client = require("../../src/objects/client")

const api = "http://10.0.0.10"
const email = "mail@gastrodon.io"
const password = "foobar2000"

jest.setTimeout(30000)

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
        api,
        email,
    })
    await client.login({
        password
    })

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

    await client.login({
        password: "Ah shit, here we go again"
    })

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

    await client.login({
        secret: "You picked the wrong house fool"
    })

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

test("login with jack and shot", async () => {
    expect((new Client()).login()).rejects.toEqual("email is required")
})

test("login stored secret", async () => {
    let secreter = new Client({
        api,
        email
    })
    await secreter.login({
        password
    })


    let client = new Client({
        api,
        email,
        secret: secreter._secret
    })

    // Patch the `headers` getter
    // so that it doesn't auto rotate keys
    Object.defineProperty(client, "headers", {
        get: async () => {},
    })

    await client.login()

    expect(client._secret).toBeTruthy()
    expect(client._token).toBeTruthy()
    expect(client._token_expires).toBeTruthy()
})

test("secret login", async () => {
    let client = new Client({
        api,
        email,
    })

    await client.login({
        password
    })

    let token = client._token
    let secret = client._secret

    client._secret = null
    await client.login({
        secret
    })

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
