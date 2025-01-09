# 🎵 AI Valentine's Song Creator

![AI Valentine's Song Creator](https://img.shields.io/badge/AI-Valentine's%20Song%20Creator-FF69B4)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6)
![Vite](https://img.shields.io/badge/Vite-6.0.5-646CFF)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC)

Create personalized AI-generated love songs for Valentine's Day! This application combines the power of Gemini AI for lyrics generation and Suno AI for music creation.

## ✨ Features

- 🎤 Generate custom love song lyrics using Google's Gemini AI
- 🎹 Create professional-quality music with Suno AI
- 🎨 Customize music style, genre, and voice type
- 💝 Perfect for Valentine's Day, anniversaries, or any special occasion
- 📱 Fully responsive design
- 🎯 Real-time generation progress tracking
- 💾 Local history management
- 🔄 Automatic retry mechanism for better success rate

## 🚀 Quick Start

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ai-valentines-song-creator.git
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Add your API keys to `.env`:

```env
VITE_SUNO_API_KEY=your_suno_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

5. Start the development server:

```bash
npm run dev
```

## 🛠 Deployment to Apache Server

To deploy to an Apache subfolder:

1. Build the project:

```bash
npm run build
```

2. Copy the contents of the `dist` folder to your Apache subfolder:

```bash
cp -r dist/* /path/to/apache/lyrics-to-song/
```

3. Ensure the `.htaccess` file is present in the subfolder

4. Configure Apache:

```apache
<Directory /path/to/apache/lyrics-to-song>
    Options -MultiViews
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.html [QSA,L]
</Directory>
```

5. Restart Apache:

```bash
sudo service apache2 restart
```

## 🛠️ Technologies Used

- **Frontend Framework**: React 18.3
- **Build Tool**: Vite 6.0
- **Styling**: TailwindCSS 3.4
- **Type Safety**: TypeScript 5.6
- **AI Integration**:
  - Google Gemini AI for lyrics generation
  - Suno AI for music creation
- **UI Components**: HeadlessUI
- **Animations**: Framer Motion
- **HTTP Client**: Axios

## 📝 Environment Variables

Create a `.env` file with the following variables:

```env
VITE_SUNO_API_KEY=your_suno_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Suno AI](https://suno.ai) for music generation
- [Google Gemini AI](https://deepmind.google/technologies/gemini/) for lyrics generation
- [TailwindCSS](https://tailwindcss.com) for styling
- All other open-source contributors

## 📸 Screenshots

[Add screenshots of your application here]

## 🔗 Links

- [Live Demo](your-live-demo-url)
- [Documentation](your-docs-url)
- [Report Bug](your-issues-url)
- [Request Feature](your-issues-url)
