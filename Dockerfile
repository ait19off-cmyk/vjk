# Use Python base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy everything first
COPY . .

# Install Python dependencies if requirements.txt exists
RUN if [ -f "backend/requirements.txt" ]; then pip install --no-cache-dir -r backend/requirements.txt; elif [ -f "requirements.txt" ]; then pip install --no-cache-dir -r requirements.txt; else echo "No requirements.txt found"; fi

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "backend/app.py"]
