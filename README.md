# SyncUp

SyncUp is a **prototype microservice** that synchronizes **new GitHub issues** with **ClickUp task lists**.


This service acts as a **backend intermediary**: it receives GitHub webhooks, verifies their authenticity, and automatically creates tasks in ClickUp based on repository configuration.

> ⚠️ **Important:** This is **not an official service** of ClickUp or GitHub. It is a **development prototype** intended for local testing only.

> Currently, it only handles `opened` issue events from GitHub and is intended for **local development**. Automatic installation and production deployment are planned for future versions.

---

## 🔹 How It Works

1. The user calls the endpoint `/connect` on the service.
2. SyncUp generates a `state` and redirects the user to **ClickUp** for authorization.
3. ClickUp redirects to the `/auth` endpoint of the microservice with a `code`.
4. The microservice exchanges the `code` for an **access token** and stores it internally.
5. GitHub sends webhooks when a new issue is created (`opened`).
6. SyncUp validates the webhook signature, identifies the ClickUp list associated with the repository, and automatically creates the task.

---

## 🔹 Minimum Configuration

### Environment Variables

```env
PORT=1234
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=12345
GITHUB_WEBHOOK_SECRET=your_secret
CLICKUP_CLIENT_ID=your_client_id
CLICKUP_CLIENT_SECRET=your_client_secret
```

### Repository and ClickUp List Configuration

```json
{
  "repos": {
    "SammyBytes/CodeLink": {
      "list_id": "901112081070"
    },
    "user/repo2": {
      "list_id": "clickup_list_2"
    }
  }
}
```

> Keys must be match GitHub's `repository.full_name`.

---

## 🔹 Main Dependencies

* **BunJS**: Runtime to run the microservice.
* **Hono**: Lightweight HTTP framework for endpoints.
* **ioredis**: Redis client for storing tokens and temporary states.
* **node-fetch / fetch**: To call the ClickUp API.
* **crypto**: Validate GitHub HMAC signatures and generate OAuth `state`.
* **pino**: Logging library.
* **zod**: Data validation and parsing.
* **hono-rate-limiter**: Middleware for rate limiting using Redis.
---

## 🔹 Running in Development

### Scripts

```json
"scripts": {
  "dev": "bun run --watch src/Server.ts",
  "build": "bun build src/Server.ts --outdir dist --target bun",
  "start": "bun run dist/Server.js"
}
```

### Start the Service

```bash
bun install
bun run dev
```

* Server runs at `http://localhost:1234`.
* Call `/connect` to start ClickUp authorization.
* Currently, tasks are only created for **`opened` issues**.

### Using an HTTPS Proxy for Local Development

To receive GitHub webhooks locally, you need a proxy like **[Smee.io](https://smee.io)**.

#### Installation:

```bash
npm install -g smee-client
```

#### Example Command:

```bash
smee --url https://smee.io/SSJ71U915lnucEk9 --path /api/v1/webhook/issues --port 1234
```

#### Parameter Explanation:

* `--url`: The public URL provided by Smee to receive GitHub webhooks.
* `--path`: Local path where your microservice listens for webhooks (should match `/webhook/issues`).
* `--port`: Local port where the proxy runs (should match your microservice `PORT=1234`).

> Smee forwards GitHub webhooks from the public URL to your local service, enabling you to test the integration without a public server.

---

## 🔹 Notes


* This project is a **development prototype** for testing GitHub → ClickUp integration locally.
* Users only need to **call `/connect`** to authorize their repository in ClickUp.
* ClickUp tokens are stored internally and used automatically when GitHub webhooks arrive.
* Full installation, configuration, and production deployment are planned for future versions.
* **Finding the `list_id` in ClickUp**:

  1. In the Sidebar, hover over the desired List and click the ellipsis `...` menu.
  2. Select **Copy link**.
  3. In the copied URL, locate the number that follows `/list/`. This number is the `list_id` to use in `workspace-config.json`.
* **Security**: Ensure `GITHUB_WEBHOOK_SECRET` is set to validate incoming webhooks.
* **Rate Limiting**: The service includes rate limiting to prevent abuse, allowing a maximum of 10 requests per minute per IP address.