# Repository AI

An intelligent GitHub repository analyzer that provides AI-powered insights, commit summaries, and intelligent Q&A capabilities for any GitHub repository.

## ✨ Features

- 🔍 **AI-Powered Repository Analysis** - Deep insights into repository structure and code patterns
- 📊 **Commit Summaries** - Intelligent analysis of commit history and changes
- 💬 **Intelligent Q&A** - Ask questions about any repository and get AI-powered answers
- 🔐 **Secure Authentication** - Built with NextAuth.js for secure user management
- 🎨 **Modern UI** - Clean, responsive interface built with Radix UI components
- 🌙 **Dark/Light Mode** - Theme switching support
- 📱 **PWA Ready** - Progressive Web App capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- A database (PostgreSQL recommended for production)
- GitHub OAuth App credentials
- Google AI API key (for Gemini integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd repository-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # Database
   DATABASE_URL="your-database-url"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # GitHub OAuth
   GITHUB_ID="your-github-oauth-app-id"
   GITHUB_SECRET="your-github-oauth-app-secret"
   
   # Google AI (Gemini)
   GOOGLE_API_KEY="your-google-ai-api-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Database**: [Prisma](https://prisma.io/) ORM
- **AI Integration**: Google Gemini AI via AI SDK
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **GitHub API**: [Octokit](https://github.com/octokit/octokit.js)
- **Language**: TypeScript

## 🔧 Configuration

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - Homepage URL: `http://localhost:3000` (for development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and Client Secret to your `.env.local`

### Google AI Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` as `GOOGLE_API_KEY`

## 📦 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting
- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma migrate dev` - Run database migrations

## 🔒 Security Features

The application includes several security measures:

- Content Security Policy (CSP) headers
- X-Frame-Options protection
- X-Content-Type-Options protection
- Referrer Policy configuration
- Permissions Policy for camera/microphone/geolocation

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to a GitHub repository
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Other Platforms

This Next.js application can be deployed on any platform that supports Node.js:

- Railway
- Render
- Heroku
- AWS
- DigitalOcean

Make sure to:
1. Set all required environment variables
2. Run database migrations
3. Build the application (`npm run build`)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing problems
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for hosting and deployment
- [Google](https://ai.google.dev/) for the Gemini AI API
- [Radix UI](https://www.radix-ui.com/) for the component library
- All contributors and users of this project
