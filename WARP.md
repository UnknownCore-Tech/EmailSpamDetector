# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

EmailSpamDetector is a full-stack web application that analyzes emails for spam and malicious content. Users can input email text, URLs, or upload .eml files. The system combines local heuristic analysis with AI-powered detection using the Moonshot API for comprehensive threat detection including phishing links and suspicious domains.

## Architecture

### Multi-Module Gradle Project
- **Root Project**: `spam-detector/` contains the main Gradle configuration
- **Backend**: Spring Boot application (Java 17) with reactive WebFlux
- **Frontend**: React application built with Node.js 22.16.0

### Backend Architecture (`spam-detector/backend/`)
- **Framework**: Spring Boot 3.2.12 with reactive programming (WebFlux)
- **AI Integration**: KimiService integrates with Moonshot API for AI-powered analysis
- **Controllers**:
  - `SpamController`: Main API endpoints for spam analysis (`/api/spam`)
  - `EmailController`: Alternative endpoint for raw EML analysis (`/spam-check`)
- **Configuration**: MoonshotProps handles API credentials and WebClient setup
- **Data Flow**: Reactive streams with Mono/Flux for non-blocking operations

### Frontend Architecture (`spam-detector/frontend/`)
- **Framework**: React 19.1.0 with functional components and hooks
- **Components**:
  - `SpamForm`: Main form handling email input, URLs, and file uploads
  - `SpamFactors`: Displays detected spam indicators
  - `Feedback`: User feedback component
- **Analysis**: Dual approach with local heuristic detection + backend AI analysis

## Development Commands

### Backend (from `spam-detector/backend/`)
```bash
# Build and run backend
./gradlew bootRun

# Run backend tests
./gradlew test

# Run checkstyle linting
./gradlew checkstyleMain

# Build backend JAR
./gradlew build
```

### Frontend (from `spam-detector/frontend/`)
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run frontend tests
npm test

# Run ESLint
npm run lint
```

### Full Project (from `spam-detector/`)
```bash
# Build everything
./gradlew build

# Run checkstyle on all modules
./gradlew checkstyleMain

# Build frontend via Gradle wrapper
./gradlew :frontend:buildReactApp
```

## Testing Strategy

### Backend Testing
- Location: `src/test/java/backend/`
- Framework: JUnit 5 with Spring Boot Test
- Current Status: SpamControllerTest exists but is commented out (needs MockBean setup)
- Run single test class: `./gradlew test --tests "backend.SpamControllerTest"`

### Frontend Testing
- Framework: React Testing Library with Jest
- Run tests: `npm test` (from frontend directory)
- Run single test: `npm test -- --testNamePattern="specific test"`

## Configuration

### Environment Variables
- Backend API key stored in both `.env` file and `application.yml`
- **Important**: API key is currently hardcoded - should be externalized for production

### API Configuration
- **Moonshot API**: https://api.moonshot.cn/v1
- **Model**: moonshot-v1-8k (cost-optimized)
- **Timeout**: 30 seconds
- **CORS**: Frontend runs on localhost:3000, backend on localhost:8080

### Build Configuration
- **Java Version**: 17
- **Node Version**: 22.16.0
- **NPM Version**: 10.9.2
- **Gradle**: Multi-module project with checkstyle integration

## Key Integration Points

### API Endpoints
- `POST /api/spam`: JSON payload with email/urls/emlFile
- `POST /api/spam/upload`: Multipart form data with file upload
- `POST /spam-check`: Raw EML content analysis

### Data Models
- `ChatRequest/ChatResponse`: Moonshot API communication
- `SpamVerdict`: Structured AI response format
- Frontend state: spamProb, factors, aiVerdict, aiError

### Error Handling
- Backend: Reactive error handling with fallback responses
- Frontend: Dual error states for local analysis vs AI service failures
- Timeout handling: 30-second limit on AI requests

## Development Notes

### Code Style
- **Checkstyle**: Configured with basic import rules and 2000-line file limit
- **File Structure**: Standard Maven/Gradle layout
- **Reactive Programming**: Use Mono/Flux for async operations

### Local Development
1. Start backend: `./gradlew bootRun` (port 8080)
2. Start frontend: `npm start` (port 3000) 
3. Both services must run simultaneously for full functionality

### AI Service Integration
- Service may be unavailable - frontend handles graceful degradation
- Local heuristic analysis always runs regardless of AI service status
- API key rotation requires updates to both `.env` and `application.yml`