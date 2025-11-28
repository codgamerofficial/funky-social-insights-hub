# 🎵 Orbit - Social Media Analytics & Music Platform

A comprehensive social media analytics and music streaming platform built with React, TypeScript, and Supabase.

![Orbit Platform](./public/placeholder.svg)

## ✨ Features

### 📊 Social Media Analytics
- **Multi-Platform Integration**: Connect YouTube, Facebook, and Instagram accounts
- **Real-Time Analytics**: Track followers, engagement rates, and post performance
- **AI-Powered Insights**: Get intelligent recommendations and trend analysis
- **Comprehensive Dashboard**: Visual overview of all your social media metrics
- **Video Analytics**: Detailed performance tracking for video content

### 🎵 Music Streaming
- **Audio Player**: Full-featured music player with playlist support
- **Music Library**: Organize and manage your favorite tracks
- **Search & Discovery**: Find new music and artists
- **Playlists**: Create and manage custom playlists
- **Radio Stations**: Discover curated music stations

### 🤖 AI Content Studio
- **Content Generation**: AI-powered titles, descriptions, and tags
- **Thumbnail Creation**: Generate eye-catching thumbnails with AI
- **Multi-Platform Optimization**: Content tailored for each platform
- **Creative Ideas**: Get inspiration for your next content

### 🔐 Authentication & Security
- **Secure OAuth**: Multi-platform authentication
- **Protected Routes**: Role-based access control
- **Session Management**: Persistent user sessions
- **Data Privacy**: Secure handling of user data

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **React Router** - Client-side routing
- **TanStack Query** - Powerful data synchronization

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Robust relational database
- **Row Level Security** - Fine-grained access control
- **Real-time Subscriptions** - Live data updates

### APIs & Integrations
- **YouTube Data API v3** - Video and channel analytics
- **Facebook Graph API** - Social media data
- **Instagram Basic Display** - Instagram integration
- **Google AI (Gemini)** - Content generation
- **OpenAI** - AI-powered features

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- API keys for social media platforms

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/orbit-social-analytics.git
cd orbit-social-analytics
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Copy the environment template and fill in your API keys:
```bash
cp .env.template .env
```

Configure your `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# YouTube API
VITE_YOUTUBE_CLIENT_ID=your-youtube-client-id
VITE_YOUTUBE_CLIENT_SECRET=your-youtube-client-secret
VITE_YOUTUBE_API_KEY=your-youtube-api-key

# Facebook/Instagram API
VITE_FACEBOOK_APP_ID=your-facebook-app-id
VITE_FACEBOOK_APP_SECRET=your-facebook-app-secret

# AI Services (Optional)
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_OPENAI_API_KEY=your-openai-api-key

# Music Services (Optional)
VITE_SPOTIFY_CLIENT_ID=your-spotify-client-id
VITE_SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

### 4. Database Setup
Run the Supabase migrations:
```bash
supabase db push
```

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:5173` to see the application.

## 🔧 API Configuration

### YouTube API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable YouTube Data API v3 and YouTube Analytics API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized redirect URIs
6. Create API key for basic API calls

### Facebook/Instagram API Setup
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Facebook Login product
4. Add Instagram Basic Display product
5. Configure OAuth redirect URIs
6. Submit for app review for production use

### Supabase Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to Settings > API
4. Copy URL and anon key
5. Run the provided SQL migrations

## 📱 Usage

### Getting Started
1. **Sign Up**: Create an account or sign in with Google
2. **Connect Platforms**: Link your social media accounts
3. **View Analytics**: Explore your social media performance
4. **Use AI Studio**: Generate content with AI assistance
5. **Enjoy Music**: Stream and manage your music library

### Social Media Analytics
- Connect your accounts in Platform Connections
- View real-time analytics in the Dashboard
- Get AI-powered insights and recommendations
- Track video performance across platforms

### AI Content Studio
1. Navigate to AI Studio
2. Enter your video topic or title
3. Choose target platform
4. Generate titles, descriptions, tags, or thumbnails
5. Copy or download your generated content

### Music Features
1. Access the Music section
2. Browse trending tracks
3. Create and manage playlists
4. Use the audio player for continuous playback

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── music/          # Music-specific components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility functions and services
│   ├── api/           # API clients
│   └── services/      # Business logic services
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **OAuth Integration**: Secure authentication with social platforms
- **Environment Variables**: Secure API key management
- **HTTPS Only**: Secure data transmission
- **Input Validation**: Comprehensive form and data validation

## 🎨 Customization

### Themes
The platform uses Tailwind CSS with custom design tokens. Modify `tailwind.config.js` to customize the theme.

### Components
All UI components are built with shadcn/ui and can be easily customized. See the [shadcn/ui documentation](https://ui.shadcn.com) for details.

### API Integrations
Extend the platform by adding new social media integrations in `src/lib/api/`.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables on your hosting platform

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features on GitHub Issues
- **Community**: Join our Discord server for discussions

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Supabase](https://supabase.com) for the backend infrastructure
- [Vite](https://vitejs.dev) for the lightning-fast build tool
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework

---

**Built with ❤️ by the Orbit Team**
