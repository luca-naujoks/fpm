# Financial Project Manager (FPM)

A simple virtual budget management application for tracking project finances, built with Next.js, Prisma, and SQLite.

## Features

- **Project Management** - Create and manage multiple budget projects
- **Transaction Tracking** - Record income and expenses with descriptions and dates
- **Monthly Transactions** - Support for recurring monthly transactions
- **Budget Overview** - Track spending against project budgets

## Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org) with React 19
- **Database**: SQLite with [Prisma ORM](https://prisma.io)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **UI Components**: [Radix UI](https://radix-ui.com) + [shadcn/ui](https://ui.shadcn.com)
- **Tables**: [TanStack Table](https://tanstack.com/table)

## Docker

Build and run with Docker form source:

```bash
# Build the image
docker build -t fpm .

# Run the container
docker run -p 3000:3000 fpm
```

The container automatically runs database migrations on startup.

### Docker Compose (optional)

```yaml
services:
   fpm:
      container_name: financial-project-management
      image: ghcr.io/luca-naujoks/fpm:latest
      ports:
         - 3000:3000
      volumes:
         - prisma-data:/app/prisma
      restart: unless-stopped

volumes:
   prisma-data:
```

## Getting Started
### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/luca-naujoks/fpm.git
   cd fpm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

MIT
