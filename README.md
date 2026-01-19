# RESUMIA - AI-Powered Resume Analysis & Job Matching Platform

A comprehensive Full-Stack application that helps users optimize their resumes using AI and find matching job opportunities.

## 🏗️ Project Structure

This is a microservices-based application with the following components:

```
.
├── resumia/              # Next.js Frontend + Backend (Port 3002)
├── webcroller/           # Job Crawler Service (Port 8000)
├── resume_score/         # Flask ML API (Port 5000)
├── resume_ml_model/      # Advanced ML Models
└── open-resume/          # Resume Builder (Port 3001) - Located in Pictures folder
```

## 🚀 Features

### Resume Management
- Upload PDF/DOCX resumes (10MB max)
- AI-powered resume parsing (OpenAI)
- ML-based resume scoring (0-10 scale)
- Resume analysis with suggestions
- View and manage uploaded resumes

### Job Search
- Multi-platform job scraping (5 sources)
- Real-time web crawling
- Indeed, LinkedIn, Glassdoor, Rozee.pk, Mustakbil.com
- Alternative: Google Cloud Talent API & RapidAPI

### User Authentication
- Secure JWT-based authentication
- Email validation
- Password reset functionality
- User profile management

### Resume Builder
- External integration with OpenResume
- Drag-and-drop interface
- ATS-friendly templates
- Real-time PDF preview

## 🛠️ Technology Stack

### Frontend
- Next.js 15.3.2
- React 19
- TypeScript 5
- Tailwind CSS 4.1
- Redux Toolkit

### Backend
- Node.js + Express.js
- PostgreSQL 15
- Prisma ORM 6.10.1
- JWT Authentication

### ML/NLP Services
- Python Flask
- Scikit-learn
- PyTorch
- NLTK, spaCy
- OpenAI GPT

### Web Scraping
- Puppeteer
- Cheerio
- Axios

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 15

### 1. Install Resumia (Next.js Frontend)
```bash
cd resumia
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 2. Install Web Crawler
```bash
cd webcroller
npm install
npm start
```

### 3. Install Flask ML API
```bash
cd resume_score
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 4. Install Advanced ML Model (Optional)
```bash
cd resume_ml_model
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

## 🔐 Environment Variables

Create `.env.local` files in each service directory:

### resumia/.env.local
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/resumia"
JWT_SECRET="your-jwt-secret"
OPENAI_API_KEY="your-openai-key"
RAPIDAPI_KEY="your-rapidapi-key"
USE_RAPIDAPI="true"
NODE_ENV="development"
```

### webcroller/.env
```env
PORT=8000
NODE_ENV="development"
```

### resume_score/.env
```env
FLASK_APP=app.py
FLASK_ENV=development
PORT=5000
```

## 🌐 Ports

| Service | Port | URL |
|---------|------|-----|
| Resumia Frontend | 3002 | http://localhost:3002 |
| OpenResume Builder | 3001 | http://localhost:3001 |
| Web Crawler API | 8000 | http://localhost:8000 |
| Flask ML API | 5000 | http://localhost:5000 |
| PostgreSQL | 5432 | localhost:5432 |

## 📚 API Documentation

See [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md) for complete API documentation.

## 🚢 Deployment

See [resumia/DEPLOYMENT.md](./resumia/DEPLOYMENT.md) for deployment instructions.

### Recommended Platforms
- **Frontend**: Vercel, Netlify
- **Full Stack**: Railway.app, Render.com
- **Database**: Neon.tech, Vercel Postgres

## 👨‍💻 Development

```bash
# Start all services (in separate terminals)
cd resumia && npm run dev          # Terminal 1
cd webcroller && npm start         # Terminal 2
cd resume_score && python app.py   # Terminal 3
```

## 📝 License

This is a Final Year Project (FYP) for educational purposes.

## 🤝 Contributing

This is a student project. Contributions are welcome for educational purposes.

## 📧 Contact

For questions or issues, please open an issue on GitHub.
