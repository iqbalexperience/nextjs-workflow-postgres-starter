This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Follow these steps to set up and run the project:

### 1. Install Dependencies
Install the project dependencies using `pnpm`:
```bash
pnpm install
```

### 2. Configure the Database
Create a PostgreSQL database and add the connection string to your `.env` file (you can copy `env.example` to `.env` as a starting point):
```env
WORKFLOW_POSTGRES_URL=postgres://postgres:mysecretpassword@localhost:5432/your_database_name
```

### 3. Initialize the Workflow Database
Run the setup script to initialize the required PostgreSQL tables for the workflow:
```bash
npx workflow-postgres-setup
```

### 4. Run the Development Server
Start the Next.js development server:
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 5. Launch Workflow Observability
In a separate terminal, start the workflow web dashboard to observe your workflows:
```bash
npx workflow web
```


This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
