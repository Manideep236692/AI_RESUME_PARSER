# Resume Parser AI Service

A simple Flask-based service for parsing resume files and extracting structured information.

## Setup

1. **Install Python 3.8+** if not already installed

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # On Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Running the Service

1. **Start the Flask development server:**
   ```bash
   python app.py
   ```

2. **The service will be available at:**
   - Main endpoint: `http://localhost:5000/api/v1/parse`
   - Health check: `http://localhost:5000/api/v1/health`

## API Endpoints

### Parse Resume
- **URL:** `/api/v1/parse`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `resume`: The resume file to parse (PDF, DOC, DOCX)
- **Response:** JSON with parsed resume data

### Health Check
- **URL:** `/api/v1/health`
- **Method:** `GET`
- **Response:** Service status information

## Development

This is a mock implementation. To improve it, consider:

1. Adding proper resume parsing using libraries like:
   - `PyPDF2` for PDFs
   - `python-docx` for Word documents
   - `pdfminer.six` for better PDF text extraction
   - `spaCy` or `NLTK` for NLP processing

2. Adding error handling for different file types

3. Implementing proper logging

4. Adding tests

## Environment Variables

Create a `.env` file to set environment variables:

```
FLASK_APP=app.py
FLASK_ENV=development
```
