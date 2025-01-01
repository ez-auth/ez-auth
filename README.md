# EzAuth

## Description

EzAuth is an open-source authentication server using [hono](https://hono.dev/)

## Installation

1. Ensure you have [bun](https://bun.sh/) installed
2. Clone the repository

   ```bash
   git clone https://github.com/ez-auth/ez-auth.git
   ```

3. Run `bun install`
4. Copy and update the `.env` file

   > **Note:** Update the necessary environment variables like OAuth keys, SMTP settings, etc.

   ```bash
   cp .env.example .env
   ```

### Set up the database

Ensure you have an **PostgreSQL** database running and update the `.env` file with the database connection details

or you can just run the `docker-compose up` command to run a local database

```bash
docker-compose up -d
```

> Note: Remember to update the database connection details in the `.env` file

Then, run migrations

```bash
bun run prisma:migrate-save
```

### Set up other features

List features need to be set up:

- Google OAuth
- GitHub OAuth
- Email (SMTP)
- SMS (Twilio)

### Dependencies, environment variables

## Usage

### Development

```bash
bun run dev
```

Thanks to Scalar, Open API/Swagger UI, you can view the API documents at [http://localhost:25000/reference](http://localhost:25000/api/reference) for Scalar and [http://localhost:25000/api/docs](http://localhost:25000/api/docs) for Open API/Swagger UI.

> Note: the base path: http://localhost:25000 is set in the `.env` file as `API_URL`

### Production

First, build the application

```bash
bun run build
```

Then, start the application

```bash
bun run start
```

## License

This project is released under the [MIT License](LICENSE).

## Star History

<a href="https://star-history.com/#ez-auth/ez-auth&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=ez-auth/ez-auth&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=ez-auth/ez-auth&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=ez-auth/ez-auth&type=Date" />
 </picture>
</a>
