# Click Game

A simple click game with high score tracking, built with JavaScript frontend and Python Flask backend. Deployable on Render using Docker.

## How to Play

1. Click the "Start Game" button
2. Click the green button as many times as you can within 30 seconds
3. Try to beat your high score!

## Deployment on Render

1. Fork this repository to your GitHub account
2. Create a new Web Service on Render
3. Connect it to your forked repository
4. Set the build type to "Docker"
5. Deploy!

The application will be available at `https://your-app-name.onrender.com`

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend will be running at `http://localhost:5000`

### Frontend

The frontend files are in the [frontend](frontend) directory. During development, you can serve them using any static file server:

```bash
cd frontend
npx serve
```

Or configure your backend to serve the frontend files as shown in the [app.py](backend/app.py) file.

## API Endpoints

- `GET /api/highscore` - Get the current high score
- `POST /api/highscore` - Update the high score (requires JSON body with `highscore` field)

## Architecture

- Frontend: HTML, CSS, JavaScript
- Backend: Python Flask
- Deployment: Docker container on Render