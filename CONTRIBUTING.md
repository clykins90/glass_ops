# Contributing to GlassOps

We love your input! We want to make contributing to GlassOps as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Process

1. Update the README.md or documentation with details of changes if applicable
2. Update the TODO.md file with your completed tasks
3. The PR should work in a development environment
4. Once reviewed, the PR will be merged by a maintainer

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- Git

### Initial Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd glass_agent
   ```

2. Install dependencies
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables
   ```bash
   # Server environment variables
   cd ../server
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. Start the development servers
   ```bash
   # In the server directory
   npm run dev
   
   # In a new terminal, in the client directory
   npm run dev
   ```

## Code Style

We use ESLint and Prettier to maintain code quality. Make sure to run the linter before submitting a pull request:

```bash
# Server
cd server
npm run lint

# Client
cd client
npm run lint
```

## License

By contributing, you agree that your contributions will be licensed under the project's license. 