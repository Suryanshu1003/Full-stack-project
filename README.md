Enterprise OS is a full-stack project management and collaboration suite designed to streamline task delegation between administrators and team members. The platform integrates a centralized dashboard, a real-time task portal, an interactive project calendar, and an AI-driven assistant to optimize workflow management and deadline tracking.

Core Features
Role-Based Access Control: Secure authentication system with distinct interfaces for Admin (Ansh Kaushik) and Users (Yukti Sharma, Manav Sharma).

Administrative Oversight: Admins can create, describe, and assign technical objectives to specific team members with set deadlines.

Task Portal: A detailed view for users to track their assigned work, including comprehensive descriptions and deadline monitoring.

Project Calendar: A JIRA-inspired visual timeline that maps tasks to specific dates for better resource planning.

AI Assistant: A system intelligence module that helps users query their upcoming deadlines and system endpoints using natural language.

Persistent Storage: Integration with MongoDB for reliable data management and state retention.

Tech Stack
Frontend: React.js, CSS3 (Custom Variables & Grid)

Backend: Node.js, Express.js

Database: MongoDB via Mongoose

State Management: React Hooks (useState, useEffect)

Communication: RESTful API & CORS

System Architecture
The application follows a decoupled architecture where the React frontend communicates with a Node/Express REST API. Authentication is handled through a secure login flow, and data visibility is filtered at the server level based on the authenticated user's role and email identity.

Setup Instructions
Clone the repository

Navigate to the backend directory and run npm install

Ensure MongoDB is running locally on port 27017

Start the server using node server.js (Initial run will seed the default credentials)

preview - https://sarthakbansalgit.github.io/ansh_repo/

Navigate to the frontend directory and run npm install

Launch the application using npm start
