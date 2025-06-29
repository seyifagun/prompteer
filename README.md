# Prompteer - AI Prompt Sharing Platform

## 🌟 Overview
Prompteer is a modern full-stack application built with Next.js, designed to create and share AI prompts. It provides a platform for users to discover, create, and share creative prompts for AI applications.

## ✨ Features
- **User Authentication**: Secure sign-in functionality
- **Create and Share**: Easy-to-use interface for creating and sharing AI prompts
- **Search & Discovery**: Find prompts by content, tag, or username
- **Profile Management**: Personal dashboard to manage your created prompts
- **CRUD Operations**: Full control over your prompts - Create, Read, Update, and Delete
- **Responsive Design**: Beautiful, modern UI that works across all devices

## 🛠️ Built With
- Next.js - The React Framework
- MongoDB - Database
- NextAuth - Authentication
- TailwindCSS - Styling

## 🚀 Getting Started

### Prerequisites
- Node.js (14.x or higher)
- npm or yarn
- MongoDB account

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/prompteer-fullstack_ai_app.git
cd prompteer-fullstack_ai_app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env` file in the root directory and add:
```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE OR GITHUB_CLIENT_ID=your_google/github_client_id
GOOGLE OR GITHUB_CLIENT_SECRET=your_google/github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Project Structure
- `app/` - Next.js 13 app directory containing routes and layouts
- `components/` - Reusable React components
- `models/` - MongoDB schema models
- `public/` - Static assets
- `styles/` - Global styles and Tailwind CSS configuration
- `utils/` - Utility functions and database connection

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

