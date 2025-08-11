# 🤖 Repository AI

<div align="center">
  
[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-blue?style=for-the-badge)](https://repository-ai-3ge9.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**An AI-powered tool that lets you chat with your GitHub repositories**

*Transform complex codebases into conversational experiences*

</div>

---

## 🌟 Overview

Repository AI revolutionizes how developers interact with code repositories. Instead of manually browsing through countless files and commits, simply ask questions in natural language and get instant, AI-generated insights about your codebase.

Perfect for:
- 🚀 **New team members** getting up to speed
- 📖 **Documentation gaps** in legacy projects  
- 🔍 **Code exploration** and understanding
- ⚡ **Rapid prototyping** and feature planning

## ✨ Key Features

### 💬 Intelligent Code Conversations
- Ask questions about any part of your repository in plain English
- Get contextual answers based on your specific codebase
- Understand complex code logic without deep diving

### 🧠 AI-Powered Summaries
- **File Analysis**: Comprehensive summaries of individual code files
- **Commit History**: Understand what changed and why
- **Repository Structure**: High-level architecture insights
- **Function Documentation**: Automatic code documentation

### 🔍 Smart Code Navigation
- Locate relevant files and functions instantly
- Understand dependencies and relationships
- Get suggestions for code improvements

### 📊 Repository Insights
- Analyze coding patterns and practices
- Identify potential refactoring opportunities
- Track project evolution over time

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15, React, TypeScript |
| **Styling** | Tailwind CSS, Radix UI |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | PostgreSQL (via Prisma) |
| **Authentication** | NextAuth.js with GitHub OAuth |
| **AI/ML** | Google Generative AI, LangChain, Groq SDK |
| **APIs** | GitHub REST API (via Octokit) |
| **Deployment** | Vercel |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- GitHub account for OAuth
- Database (PostgreSQL recommended)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/repository-ai.git
cd repository-ai
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/repository_ai"

# GitHub OAuth (create at: https://github.com/settings/applications/new)
GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"

# GitHub API Access
GITHUB_TOKEN="your_personal_access_token"

# AI Services
GOOGLE_API_KEY="your_google_ai_api_key"
GROQ_API_KEY="your_groq_api_key"

# NextAuth
NEXTAUTH_SECRET="your_random_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage Guide

### Getting Started

1. **Sign in** with your GitHub account
2. **Connect a repository** from your GitHub account
3. **Wait for AI analysis** (first-time setup may take a few minutes)
4. **Start chatting** with your codebase!

### Example Queries

```
"What does the authentication system do?"
"Explain the database schema"
"How does the API routing work?"
"What are the main components in this React app?"
"Show me recent changes to the user model"
```

## 🏗️ Project Structure

```
repository-ai/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application pages
│   └── components/        # React components
├── lib/                   # Utility functions and configs
│   ├── ai/               # AI service integrations
│   ├── github/           # GitHub API helpers
│   └── prisma/           # Database utilities
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🔧 Configuration

### GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

### AI Service Setup

#### Google AI
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to your `.env.local` file

#### Groq (Optional)
1. Sign up at [Groq Console](https://console.groq.com/)
2. Generate an API key
3. Add to your `.env.local` file

## 📦 Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**:
   - Import your GitHub repository
   - Add all environment variables
   - Deploy!

3. **Configure Database**:
   - Set up a production PostgreSQL database
   - Update `DATABASE_URL` in Vercel environment variables
   - Run migrations: `npx prisma migrate deploy`

### Environment Variables for Production

Remember to set all environment variables in your deployment platform:
- Database connection strings
- GitHub OAuth credentials (update callback URLs)
- AI API keys
- NextAuth configuration

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Contributing Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Reset database
npx prisma migrate reset
npx prisma generate
```

**GitHub API Rate Limits**
- Ensure your `GITHUB_TOKEN` has sufficient permissions
- Consider upgrading to GitHub Pro for higher rate limits

**AI Service Errors**
- Verify API keys are correctly set
- Check service status pages for outages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [GitHub](https://github.com/) for the comprehensive API
- [Google AI](https://ai.google/) for powerful language models
- [Vercel](https://vercel.com/) for seamless deployment
- The open-source community for inspiration and tools

## 📞 Support

- 🐛 [Report Issues](https://github.com/priyanshupatel84/repository-ai/issues)
- 💬 [Discussions](https://github.com/priyanshupatel84/repository-ai/discussions)
- 📧 [Contact](mailto:priyanshu.patel.ug22@nsut.ac.in)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by [Priyanshu Patel](https://github.com/priyanshupatel84)

</div>
