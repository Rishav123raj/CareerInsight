
# CareerInsight: Bridging Employability Gaps

**CareerInsight** is a Next.js web application designed to help students and recent graduates navigate their career paths more effectively. It leverages Artificial Intelligence (powered by Google's Gemini models via Genkit) to provide personalized feedback on employability, suggest tailored career recommendations, and outline potential career pathways.

## Table of Contents

1.  [The Problem](#the-problem)
2.  [Our Solution](#our-solution)
3.  [Key Features](#key-features)
4.  [Technology Stack](#technology-stack)
5.  [System Architecture](#system-architecture)
6.  [AI Integration Details](#ai-integration-details)
7.  [Authentication](#authentication)
8.  [Project Structure](#project-structure)
9.  [Setup and Running the Project](#setup-and-running-the-project)
10. [Environment Variables](#environment-variables)
11. [Future Enhancements](#future-enhancements)

## The Problem

Students and recent graduates often face significant challenges when planning their careers:
*   **Career Path Uncertainty:** Difficulty in identifying suitable career options that align with their skills and interests.
*   **Skill Gap Awareness:** Lack of clarity on specific skills required for desired job roles and how to acquire them.
*   **Employability Assessment:** Uncertainty about their current standing and competitiveness in the job market.
*   **Information Overload:** Difficulty sifting through generic advice to find personalized and actionable guidance.

## Our Solution

CareerInsight addresses these challenges by providing a user-friendly platform where students can:
*   Input their academic, coding, extracurricular, and general skills profile.
*   Receive AI-driven insights, including:
    *   An **Employability Score** with constructive feedback.
    *   Personalized **Career Recommendations** with actionable steps and learning resources (courses, books/PDFs, YouTube videos).
    *   **Career Pathway Suggestions** highlighting potential job roles and fields.

The core goal is to empower users with data-driven, personalized insights to enhance their employability and make informed career decisions.

## Key Features

*   **User Profile Input:** Intuitive forms for capturing comprehensive student data.
*   **AI-Powered Employability Score:** A dynamic score (0-100) based on the user's profile, categorized into color-coded bands (Critically Low, Developing, Good, Excellent) with AI-generated feedback and improvement suggestions.
*   **Personalized AI Recommendations:** Actionable advice tailored to the user's profile, including suggestions for skill development, project work, and networking, complete with links to diverse learning resources.
*   **AI-Suggested Career Pathways:** Identification of suitable job roles and career fields, helping users explore options aligned with their strengths.
*   **Simulated Analytics:** Visual charts (Bar and Line charts using Recharts) for GitHub commit history and coding platform (e.g., LeetCode) problem-solving statistics. (Currently uses simulated data for frontend demonstration).
*   **Secure Local Authentication:** User sign-up and sign-in functionality using a local JSON file for data storage and `bcryptjs` for password hashing. Client-side session management via `localStorage`.
*   **Responsive User Interface:** Built with ShadCN UI components and Tailwind CSS for a modern, clean, and responsive experience across devices.

## Technology Stack

*   **Frontend:**
    *   Next.js (App Router, React Server Components)
    *   React
    *   TypeScript
    *   ShadCN UI (Component Library)
    *   Tailwind CSS (Styling)
    *   Lucide React (Icons)
    *   Recharts (Charts)
    *   `react-hook-form` with `zodResolver` (Form handling and validation)
*   **Backend/Server-Side Logic:**
    *   Next.js (Server Actions for authentication)
    *   Node.js (underlying Next.js runtime)
*   **AI Integration:**
    *   Genkit (Google AI SDK)
    *   Google Gemini Models (via Genkit Google AI Plugin - specifically `gemini-2.0-flash`)
    *   Zod (Schema definition and validation for AI flow inputs/outputs)
*   **Authentication (Local):**
    *   `bcryptjs` (Password Hashing)
    *   Local JSON file (`src/data/users.json`) for user data storage.
*   **Development & Tooling:**
    *   `npm`
    *   ESLint, TypeScript for code quality.

## System Architecture

CareerInsight follows a modern web architecture centered around Next.js:

1.  **Client-Side (Browser):**
    *   Users interact with the frontend built using Next.js (React components, ShadCN UI, Tailwind CSS).
    *   Forms are managed by `react-hook-form`.
    *   Client-side routing handled by Next.js App Router.
    *   Authentication state managed using `localStorage`.

2.  **Server-Side (Next.js):**
    *   **Server Actions (`src/actions/auth.ts`):** Handle user sign-up and sign-in requests. These actions interact directly with the local user store (`src/data/users.json`), performing operations like password hashing/comparison.
    *   **AI Flows (`src/ai/flows/*.ts`):** These are server-side modules.
        *   When a user requests AI insights (e.g., from the Career Predictor page), client-side components call exported functions (e.g., `calculateEmployabilityScore`, `generateCareerRecommendations`).
        *   These functions, marked with `'use server'`, execute on the server.
        *   They utilize the Genkit SDK to define and run AI prompts with Google's Gemini models.
        *   Input data from the user's profile is passed to these flows.
        *   The AI model processes the input based on structured prompts and Zod schemas, returning formatted JSON data (scores, recommendations, pathways).
        *   This data is then sent back to the client for display.

3.  **AI Service (Google Cloud - Gemini via Genkit):**
    *   Genkit acts as an intermediary, sending requests (prompts and user data) to Google's Generative AI models.
    *   The models generate responses based on the instructions and provided context.
    *   Genkit handles the communication and returns the structured response to the Next.js server-side flow.

4.  **Local User Storage (`src/data/users.json`):**
    *   A simple JSON file stores user credentials (ID, name, email, hashed password). This is used by the server-side authentication actions.

## AI Integration Details

The AI capabilities are central to CareerInsight and are implemented using Genkit:

*   **Genkit Initialization (`src/ai/genkit.ts`):**
    *   Initializes the Genkit library.
    *   Configures the Google AI plugin with the `GOOGLE_API_KEY` environment variable.
    *   Sets the default model (e.g., `gemini-2.0-flash`).

*   **AI Flows (`src/ai/flows/`):**
    *   Each core AI feature is encapsulated in its own flow file (e.g., `calculate-employability-score.ts`, `generate-career-recommendations.ts`).
    *   **Zod Schemas:** Define the expected structure for input (`InputSchema`) and output (`OutputSchema`) for each AI interaction. This ensures data consistency and helps guide the LLM's response format.
    *   **`ai.definePrompt`:** Creates a Genkit prompt object.
        *   Takes the input and output Zod schemas.
        *   Contains the actual prompt string (using Handlebars templating `{{{ }}}` to inject input data) that instructs the Gemini model on its task.
    *   **`ai.defineFlow`:** Wraps the prompt and defines an AI flow.
        *   Takes input and output schemas.
        *   Contains the asynchronous logic to call the prompt with user data and return the AI's output.
    *   **Exported Functions:** Each flow file exports a primary function (e.g., `async function calculateEmployabilityScore(input)`) that client-side components (via server actions or server components) can call.

*   **Example Flow (Career Recommendations):**
    1.  User submits their profile data.
    2.  The frontend calls `generateCareerRecommendations(profileData)`.
    3.  The `generateCareerRecommendationsFlow` on the server is invoked.
    4.  The flow calls the `careerRecommendationsPrompt` with the user's data.
    5.  Genkit sends the formatted prompt to the Gemini model.
    6.  Gemini generates recommendations, suggested roles, and learning resources (courses, books, YouTube links) based on the prompt and its training.
    7.  The response (ideally matching the `CareerRecommendationsOutputSchema`) is returned to the flow, then to the client.

## Authentication

User authentication is handled locally:

*   **Sign-Up (`src/app/signup/page.tsx` -> `src/actions/auth.ts/signUpUser`):**
    1.  User provides name, email, and password.
    2.  Passwords are hashed using `bcryptjs`.
    3.  A new user object is created with a unique ID.
    4.  The user object is appended to `src/data/users.json`.
*   **Sign-In (`src/app/signin/page.tsx` -> `src/actions/auth.ts/signInUser`):**
    1.  User provides email and password.
    2.  The system finds the user by email in `src/data/users.json`.
    3.  `bcryptjs.compare` is used to verify the password against the stored hash.
    4.  On success, `localStorage` is updated on the client (`isAuthenticated: true`, `userName`, `userEmail`).
*   **Session Management:**
    *   Client-side components (Header, dashboard pages) check `localStorage.getItem('isAuthenticated')` to determine user status and protect routes.
    *   Sign-out clears these `localStorage` items.

## Project Structure

```
career-insight/
├── .env                # Root environment variables (GOOGLE_API_KEY)
├── next.config.ts      # Next.js configuration
├── package.json
├── README.md           # This file
├── src/
│   ├── actions/
│   │   └── auth.ts     # Server actions for local authentication
│   ├── ai/
│   │   ├── dev.ts      # Genkit development server entry point
│   │   ├── flows/      # AI processing logic
│   │   │   ├── calculate-employability-score.ts
│   │   │   ├── generate-career-recommendations.ts
│   │   │   └── suggest-career-pathways.ts
│   │   └── genkit.ts   # Genkit initialization and configuration
│   ├── app/            # Next.js App Router
│   │   ├── dashboard/
│   │   │   ├── career-predictor/page.tsx # Main form for AI insights
│   │   │   ├── student/page.tsx        # Student's main dashboard
│   │   │   └── page.tsx                # Redirect or old dashboard
│   │   ├── signin/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── globals.css # Global styles and ShadCN theme variables
│   │   ├── layout.tsx  # Root layout
│   │   └── page.tsx    # Landing page
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx
│   │   └── ui/         # ShadCN UI components
│   ├── data/
│   │   └── users.json  # Local user storage
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── image/
│   │   └── careerinsight.png # Image for landing page
│   ├── lib/
│   │   ├── types.ts    # TypeScript type definitions
│   │   └── utils.ts    # Utility functions (e.g., cn for Tailwind)
│   └── .env            # Source directory environment variables (can be used if needed)
├── tailwind.config.ts
└── tsconfig.json
```

## Setup and Running the Project

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd career-insight
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    (Or `yarn install` if you prefer Yarn)

3.  **Set up Environment Variables:**
    *   Create a `.env` file in the root of the project.
    *   Add your Google AI API key:
        ```env
        GOOGLE_API_KEY=YOUR_GEMINI_API_KEY_PLEASE_REPLACE_ME
        ```
        Replace `YOUR_GEMINI_API_KEY_PLEASE_REPLACE_ME` with your actual API key from Google AI Studio or Google Cloud.

4.  **Run the development server:**
    The application uses Genkit, which has its own development server that needs to run alongside the Next.js dev server.

    *   **Terminal 1: Start Genkit Dev Server**
        ```bash
        npm run genkit:dev
        ```
        Or for auto-reloading on Genkit flow changes:
        ```bash
        npm run genkit:watch
        ```
        This typically starts on `http://localhost:3400` and provides a UI to inspect flows.

    *   **Terminal 2: Start Next.js Dev Server**
        ```bash
        npm run dev
        ```
        This usually starts the Next.js app on `http://localhost:3000`.

5.  **Open the application:**
    Navigate to `http://localhost:3000` in your browser.

## Environment Variables

*   `GOOGLE_API_KEY`: **Required**. Your API key for accessing Google Generative AI models (e.g., Gemini). This should be placed in the root `.env` file.

## Future Enhancements

*   **Database Integration:** Migrate from local JSON user storage to a robust database solution (e.g., Firebase Firestore, Supabase, MongoDB) for better scalability, data management, and real-time features.
*   **Persistent Profile Data:** Allow users to save their profile information from the Career Predictor page to the database and have it pre-fill on subsequent visits.
*   **Real Analytics Integration:** Fetch live data from GitHub, LeetCode (with user consent and API availability) instead of using simulated data for charts.
*   **Advanced AI Features:**
    *   Resume parsing and analysis.
    *   Mock interview simulations with AI feedback.
    *   Generation of personalized learning roadmaps.
*   **Job Board Integration:** Connect with job APIs to suggest relevant live job openings based on the user's profile and suggested roles.
*   **User Profile Management:** Allow users to edit and update their profile details after initial submission.
*   **OAuth Authentication:** Implement social sign-in options (Google, GitHub).
*   **Enhanced UI/UX:** Further refine the user interface and user experience based on feedback.
*   **Comprehensive Error Handling & Logging:** Implement more robust error handling and server-side logging.
```
