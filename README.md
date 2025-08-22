# Travel Itinerary Planner

A modern, full-stack web application designed to help users plan, organize, and discover travel itineraries. Users can create detailed trip plans, manage activities, save favorite destinations, and find inspiration for future travels. The application is built with a React front-end and leverages Firebase for backend services.

### Live: trip-nest-1.web.app

## Features

- **User Authentication**: Secure sign-up and login with email/password or Google accounts.
- **Itinerary Management**: Create, read, update, and delete travel itineraries with details such as title, destination, dates, and notes.
- **Activity Planning**: Add and view a schedule of activities for each day of a trip.
- **Image Uploads**: Add a cover photo to each itinerary using Cloudinary for a visual dashboard experience.
- **Search and Filter**: Easily find itineraries by searching for a destination or filtering by trip type (e.g., Adventure, Leisure, Work, Favorites).
- **Discover Page**: A public-facing page that uses the Unsplash API to showcase beautiful, random travel destinations to inspire users.
- **AI-Powered Content**: Integrates the Gemini API to generate engaging descriptions and categories for the destinations on the Discover page.
- **Persistent Wishlist**: Logged-in users can save their favorite destinations from the Discover page to a personal wishlist, stored securely in Firestore.
- **Responsive Design**: A clean, modern UI built with Tailwind CSS and shadcn/ui, fully responsive for both desktop and mobile devices.

## Tech Stack

- **Front-End**: React.js, Vite, Tailwind CSS
- **UI Components**: shadcn/ui, patterncraft.fun
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: React Router
- **Backend-as-a-Service (BaaS)**: Firebase
  - **Authentication**: Firebase Authentication
  - **Database**: Firestore
- **Image Hosting**: Cloudinary
- **APIs**: Unsplash API, Gemini API

## Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd trip-nest
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add your API keys and Firebase configuration. See the section below for details.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Environment Variables

 ```bash
   VITE_CLOUDINARY_CLOUD_NAME="YOUR_CLOUDINARY_CLOUD_NAME"
VITE_CLOUDINARY_UPLOAD_PRESET="YOUR_CLOUDINARY_UPLOAD_PRESET"
VITE_UNSPLASH_ACCESS_KEY="YOUR_UNSPLASH_ACCESS_KEY"
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```




## Deployment

This project is configured for easy deployment with Firebase Hosting.

1.  **Install Firebase CLI:**
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login and Initialize Firebase:**
    ```bash
    firebase login
    firebase init
    ```
    During initialization, select "Hosting" and connect to your existing Firebase project. Set the public directory to `dist` and configure it as a single-page app.

3.  **Build the project for production:**
    ```bash
    npm run build
    ```

4.  **Deploy to Firebase Hosting:**
    ```bash
    firebase deploy
    ```

