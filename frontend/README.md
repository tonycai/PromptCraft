# PromptCraft Frontend

A Next.js frontend application for PromptCraft - a framework for assessing prompting proficiency.

## Features

- **User Authentication**: Register, login, and manage user accounts
- **Question Browser**: Browse and view detailed prompting challenges
- **Submission System**: Submit prompts and see AI-generated responses
- **Evaluation Dashboard**: View expert evaluations and feedback
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **UI Components**: Custom components with Headless UI
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- PromptCraft API running on http://localhost:8000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Main dashboard
│   ├── questions/      # Question browsing and submission
│   ├── submissions/    # Submission history
│   └── evaluations/    # Evaluation results
├── components/         # Reusable UI components
│   ├── forms/         # Form components
│   ├── layout/        # Layout components
│   └── ui/            # Base UI components
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── store/             # State management
└── types/             # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Docker

The application includes a multi-stage Dockerfile for production deployment:

```bash
docker build -t promptcraft-frontend .
docker run -p 3000:3000 promptcraft-frontend
```

## API Integration

The frontend integrates with the PromptCraft API for:

- User authentication and management
- Question fetching and details
- Prompt submission and AI response generation
- Evaluation creation and retrieval

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request