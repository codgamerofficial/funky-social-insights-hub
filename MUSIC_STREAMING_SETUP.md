# 🎵 Music Streaming Platform Setup Guide

## Overview

This project has been transformed from a social media insights hub into a **complete open source music streaming platform** using YouTube as the music source. The platform includes all essential features you'd expect from a modern music streaming service.

## 🎯 Features Implemented

### ✅ **Core Music Features**
- **🎧 Full Audio Player** with play, pause, skip, volume, progress controls
- **🔍 Music Search** with YouTube Music API integration
- **📚 Playlist Management** (create, edit, delete, add/remove tracks)
- **❤️ Music Library** (liked songs, recently played, history)
- **🎶 Queue Management** with reorder capabilities
- **🔀 Repeat & Shuffle** modes
- **📱 Responsive Design** for all screen sizes

### ✅ **YouTube Integration**
- **🎬 YouTube Music API** for search and discovery
- **🎵 Track Streaming** via YouTube videos
- **🖼️ Album Art & Metadata** from YouTube
- **⏱️ Duration & Quality** information

### ✅ **User Interface**
- **🏠 Music Dashboard** with multiple tabs (Home, Search, Library, Playlists, Radio)
- **📊 Trending & Recommended** music sections
- **🎛️ Expandable Player** with lyrics and queue view
- **⚡ Real-time Playback** controls and progress

### ✅ **Database & Architecture**
- **🗄️ Complete Database Schema** for music streaming
- **🔐 Row Level Security** for user data protection
- **📈 Analytics & Tracking** for listening history
- **🏷️ Comprehensive Types** and interfaces

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **YouTube Data API v3 Key** ([Get here](https://console.cloud.google.com/apis/credentials))
3. **Supabase Project** ([Create here](https://supabase.com/dashboard))

### Environment Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd funky-social-insights-hub
   npm install
   ```

2. **Set up environment variables** in `.env.local`:
   ```env
   # YouTube API Configuration
   VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
   
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Optional: YouTube OAuth (for advanced features)
   VITE_YOUTUBE_CLIENT_ID=your_youtube_client_id
   VITE_YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
   ```

3. **Run database migrations:**
   ```bash
   # Apply the music streaming database schema
   # The migration file is located at: supabase/migrations/20251128130600_create_music_streaming_schema.sql
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Main app: `http://localhost:8081`
   - Music Dashboard: `http://localhost:8081/music`

## 🎵 How to Use

### **Music Search**
1. Navigate to the **Music Dashboard** (`/music`)
2. Click on the **Search** tab
3. Search for songs, artists, or albums
4. Use filters to refine results (genre, duration, explicit content)
5. Click **Play** to start listening immediately

### **Creating Playlists**
1. Go to **Playlists** tab
2. Click **Create Playlist**
3. Add tracks by searching and clicking **+** button
4. Organize tracks by dragging and dropping

### **Music Library**
- **Liked Songs**: Heart icon on any track
- **Recently Played**: Automatically tracked
- **Playlists**: Manage your collections

### **Player Controls**
- **Play/Pause**: Main button in player
- **Skip**: Next/Previous buttons
- **Volume**: Click volume icon to adjust
- **Shuffle**: Toggle shuffle mode
- **Repeat**: Cycle through none/one/all modes
- **Expand**: Click expand button for full player view

## 🏗️ Architecture Overview

### **Frontend Components**
```
src/
├── components/music/           # Music-specific components
│   ├── AudioPlayer.tsx        # Main audio player
│   └── MusicSearch.tsx        # Search interface
├── contexts/
│   └── AudioPlayerContext.tsx # Global audio state
├── pages/
│   └── MusicDashboard.tsx     # Main music hub
├── lib/services/
│   └── youtubeMusicService.ts # YouTube API integration
└── types/
    └── music.ts               # TypeScript definitions
```

### **Database Schema**
```
music_tracks          # YouTube track information
playlists             # User playlists
playlist_tracks       # Playlist-track relationships
user_favorites        # Liked songs
user_follows          # Social features foundation
listening_history     # Playback tracking
music_analytics       # Usage statistics
user_profiles         # Extended user data
```

## 🔧 Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### **Key Technologies**
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Radix UI** for components
- **TanStack Query** for API state
- **Supabase** for backend
- **YouTube Data API v3** for music data

## 📝 API Integration

### **YouTube Music Service**
The platform uses a custom YouTube Music service that:
- Searches YouTube for music content
- Extracts track metadata (artist, duration, genre)
- Handles video duration parsing
- Provides filtering and sorting options

### **Key Methods**
```typescript
// Search for music
const results = await youtubeMusicService.searchMusic("Taylor Swift");

// Search with filters
const filtered = await youtubeMusicService.searchWithFilters(
  "pop music",
  { genre: ["pop"], duration_max: 300 }
);

// Get video details
const details = await youtubeMusicService.getVideoDetails([videoId]);
```

## 🎨 Customization

### **Styling**
- Built with **Tailwind CSS** for easy customization
- Uses **CSS variables** for theming
- Responsive design for mobile/tablet/desktop

### **Adding New Features**
1. **Extend Types**: Add to `src/types/music.ts`
2. **Create Components**: Add to `src/components/music/`
3. **Update Service**: Extend `youtubeMusicService.ts`
4. **Database Changes**: Add to migration files

## 🔒 Security

### **Row Level Security**
- All tables have RLS enabled
- Users can only access their own data
- Public content (music tracks) is readable by all

### **API Key Protection**
- YouTube API key stored in environment variables
- Client-side usage with rate limiting
- Consider server-side proxy for production

## 🚀 Deployment

### **Vercel** (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### **Other Platforms**
- **Netlify**: Add build command `npm run build`
- **Railway**: Use provided configuration
- **Self-hosted**: Build and serve static files

## 📈 Future Enhancements

### **Planned Features**
- [ ] **Lyrics Integration** with Musixmatch API
- [ ] **Social Features** (follow users, share playlists)
- [ ] **Music Discovery** with ML recommendations
- [ ] **Offline Caching** for downloaded tracks
- [ ] **Cross-fade Playback** between tracks
- [ ] **Audio Visualization** and spectrum analyzer
- [ ] **Podcast Support** alongside music
- [ ] **Collaborative Playlists** with real-time editing

## 🤝 Contributing

### **Open Source License**
This project is licensed under the **MIT License** - see the LICENSE file for details.

### **How to Contribute**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### **Development Guidelines**
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 🐛 Troubleshooting

### **Common Issues**

**YouTube API Errors**
- Check your API key is valid
- Ensure YouTube Data API v3 is enabled
- Verify quota limits aren't exceeded

**Audio Playback Issues**
- Check browser autoplay policies
- Ensure user interaction before playing audio
- Verify CORS settings for YouTube

**Database Connection**
- Verify Supabase credentials
- Check if migrations ran successfully
- Ensure RLS policies are correct

### **Performance Tips**
- Use React.memo for heavy components
- Implement virtual scrolling for large lists
- Cache frequently accessed data
- Optimize images and thumbnails

## 📞 Support

If you encounter issues:

1. **Check the documentation** above
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed description
4. **Join our community** discussions

## 🎉 Credits

Built with ❤️ using:
- YouTube Data API for music content
- Supabase for backend infrastructure
- React ecosystem for frontend
- Open source community for inspiration

---

**Enjoy your music streaming platform! 🎵**