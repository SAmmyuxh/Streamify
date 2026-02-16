# Streamify

Streamify is a comprehensive full-stack application designed to connect people through real-time communication and interactive experiences. It integrates chat, video calling, innovative AI assistance, and 3D global exploration into a seamless modern interface.

## 🚀 Key Features

*   **Real-time Chat:** Instant messaging powered by Stream Chat with support for rich media and reactions.
*   **Video Calls:** High-quality video conferencing and calling capabilities using Stream Video SDK.
*   **AI Integration:**
    *   **AI Tutor:**  Intelligent assistance and learning tools powered by Google Gemini.
    *   **Voice Processing:** Advanced speech-to-text and voice interaction features using Deepgram.
*   **Interactive 3D World:**  Explore a stunning interactive globe visualization.
*   **Secure Authentication:** robust user registration and login system secured with JWT and BCrypt.
*   **Media Management:** Optimized image and file handling powered by Cloudinary.
*   **Modern UI/UX:** A responsive, polished interface built with TailwindCSS, DaisyUI, and Framer Motion for smooth animations.

## 🛠️ Tech Stack

### Frontend
*   **Frameworks:** [React](https://react.dev/) (v19), [Vite](https://vitejs.dev/)
*   **Styling:** [TailwindCSS](https://tailwindcss.com/), [DaisyUI](https://daisyui.com/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
*   **Visualization:** [React Globe GL](https://github.com/wastur/react-globe.gl), [Framer Motion](https://www.framer.com/motion/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Routing:** React Router

### Backend
*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Framework:** [Express.js](https://expressjs.com/)
*   **Database:** [MongoDB](https://www.mongodb.com/) (using Mongoose)
*   **Authentication:** JWT, Bcryptjs
*   **Dependencies:** Dotenv, Cookie-Parser, Morgan, Cors

### APIs & Cloud Services
*   **Stream.io:** Chat and Video SDKs
*   **Google Gemini:** Generative AI
*   **Deepgram:** Voice AI
*   **Cloudinary:** Cloud Image/Video Management

## ⚙️ Getting Started

Follow these instructions to set up the project on your local machine.

### Prerequisites
*   Node.js (v16 or higher)
*   npm or yarn
*   MongoDB installed locally or a MongoDB Atlas URI
*   API Keys for Stream, Cloudinary, Google Gemini, and Deepgram

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/SAmmyuxh/Streamify.git
    cd Streamify
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd ../frontend
    npm install
    ```

### Environment Configuration

You need to create a `.env` file in **both** the `backend` and `frontend` directories with the following variables.

#### Backend (`/backend/.env`)
Create a file named `.env` in the `backend` folder:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_secret
CLIENT_URL=http://localhost:5173

# Stream.io Configuration
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Services
GEMINI_API_KEY=your_gemini_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
```

#### Frontend (`/frontend/.env`)
Create a file named `.env` in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STREAM_API_KEY=your_stream_api_key
```

### Running the Application

1.  **Start the Backend Server**
    ```bash
    cd backend
    npm run dev
    ```
    The server should start on port 5000 (connected to MongoDB).

2.  **Start the Frontend Client**
    (Open a new terminal window)
    ```bash
    cd frontend
    npm run dev
    ```
    The application will be running at `http://localhost:5173`.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the ISC License.
