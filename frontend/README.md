# Smart Recruitment Platform - Frontend

React-based frontend for the Smart Recruitment Platform with AI-powered job matching.

## Features

- **Role-based Authentication**: Separate interfaces for Job Seekers and Recruiters
- **AI Job Recommendations**: Personalized job suggestions based on resume analysis
- **Resume Management**: Upload and manage multiple resumes
- **Job Search & Filters**: Advanced search with location and job type filters
- **Application Tracking**: Track status of all job applications
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **React 18** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared components (Header, Footer, etc.)
│   ├── auth/            # Authentication components
│   ├── jobseeker/       # Job seeker specific components
│   ├── recruiter/       # Recruiter specific components
│   └── jobs/            # Job listing components
├── pages/               # Page components
├── services/            # API services
├── context/             # React Context providers
├── utils/               # Utility functions
└── styles/              # Global styles
```

## API Configuration

The frontend connects to the backend API at `http://localhost:8080/api` by default. This can be changed in:
- `src/utils/constants.js` - API_BASE_URL
- `vite.config.js` - Proxy configuration

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080/api
```

## Features by Role

### Job Seekers
- Upload and manage resumes
- View AI-powered job recommendations
- Search and filter jobs
- Apply to jobs with one click
- Track application status

### Recruiters
- Post and manage job listings
- View candidate applications
- Update application status
- Dashboard with analytics

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
