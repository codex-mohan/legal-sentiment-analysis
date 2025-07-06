# AI Legal Sentiment Analyzer - Architectural Plan

This document outlines the architectural plan for the AI Legal Sentiment Analyzer project, which utilizes a monorepo structure with a Next.js frontend, a Python backend, and integrates with IBM watsonx.ai for sentiment analysis.

## 1. Monorepo Structure (using Turborepo)

We will set up a monorepo using Turborepo. This will allow us to manage the frontend and backend projects within a single repository, sharing configurations and dependencies where appropriate.

```
/legal-sentiment-analyzer (monorepo root)
├── apps/
│   ├── web/ (Next.js frontend)
│   └── api/ (Python backend)
├── packages/
│   └── ui/ (Shared UI components, potentially using Shadcn UI)
├── turbo.json
├── package.json (for monorepo management)
└── README.md
```

*   **`apps/web/`**: This directory will contain the Next.js application for the frontend. It will handle the user interface, document uploads, and displaying results.
*   **`apps/api/`**: This directory will house the Python backend application. It will receive document uploads, interact with watsonx.ai, and return sentiment analysis results via REST APIs.
*   **`packages/ui/`**: This directory can optionally be used for shared UI components built with Shadcn UI, which can be consumed by the `apps/web` project.
*   **`turbo.json`**: Turborepo configuration file.
*   **`package.json`**: Monorepo-level dependencies and scripts.

## 2. Frontend Setup (Next.js with Shadcn UI)

The frontend will be a single-page Next.js application.

*   **Technology Stack**: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI components.
*   **Functionality**:
    *   A simple landing page with a document upload interface.
    *   Support for uploading CSV, plain text, markdown, DOCX, and PDF files.
    *   Displaying the sentiment analysis results received from the backend.
    *   Handling loading states and potential errors during the process.
*   **Document Upload**: Use HTML form or a library to handle file selection and upload. The selected file(s) will be sent to the Python backend via a REST API endpoint.
*   **Shadcn UI**: Integrate Shadcn UI components for a consistent and accessible user interface (e.g., buttons, input fields, file dropzone, display cards for results).

## 3. Python Backend Setup

The backend will be a Python application responsible for the core logic.

*   **Technology Stack**: Python, a web framework (e.g., Flask, FastAPI, or Django) to expose REST API endpoints, libraries for document parsing (e.g., `pandas` for CSV, `python-docx` for DOCX, `PyPDF2` or `pdfminer.six` for PDF), and the IBM watsonx.ai SDK.
*   **Functionality**:
    *   Receive document upload requests from the frontend via a dedicated REST API endpoint (e.g., `/analyze-sentiment`).
    *   Parse the uploaded document based on its file type to extract the text content.
    *   Prepare the extracted text for sentiment analysis using watsonx.ai Prompt Lab (few-shot prompts).
    *   Interact with the watsonx.ai API, sending the text and prompts to the chosen foundation model (FLAN-T5, Mistral, etc.).
    *   Receive the sentiment analysis results (sentiment tags, summarized insights) from watsonx.ai.
    *   Return the results to the frontend via the REST API response.
    *   Handle potential errors during file parsing, watsonx.ai interaction, or other processing steps.

## 4. Communication Flow (REST APIs)

*   The frontend will make an HTTP POST request to a backend endpoint (e.g., `/api/analyze-sentiment`), sending the uploaded document file(s) in the request body (likely using `multipart/form-data`).
*   The Python backend will receive the request, process the document(s), interact with watsonx.ai, and return a JSON response containing the sentiment analysis results (sentiment labels, summaries) for each document.

## 5. Integration with watsonx.ai

*   The Python backend will use the IBM watsonx.ai SDK to connect to the watsonx.ai service.
*   Few-shot prompts will be defined in the backend code or configuration, tailored for legal sentiment analysis.
*   The extracted text from the legal documents will be sent to the watsonx.ai API along with the prompts, specifying the desired foundation model.

## 6. Handling Different Document Types

*   The Python backend will need logic to identify the file type of the uploaded document (e.g., by checking the file extension or MIME type).
*   Based on the file type, the backend will use appropriate libraries to parse the document and extract the raw text content.
    *   `.txt`, `.md`: Read directly.
    *   `.csv`: Use `pandas` to read and potentially extract text from specific columns.
    *   `.docx`: Use `python-docx`.
    *   `.pdf`: Use `PyPDF2` or `pdfminer.six`.
*   Error handling should be included for unsupported file types or parsing errors.

## Architectural Diagram (Mermaid)

```mermaid
graph TD
    A[User] -->|Upload Document| B(Next.js Frontend)
    B -->|HTTP POST /api/analyze-sentiment| C(Python Backend)
    C -->|Parse Document| D{Document Parser}
    D -->|Extracted Text| E(watsonx.ai Prompt Lab)
    E -->|API Request (Text + Prompt)| F(IBM watsonx.ai)
    F -->|Sentiment Analysis Results| E
    E -->|Processed Results| C
    C -->|JSON Response| B
    B -->|Display Results| A
```

**Explanation of Diagram:**

*   The user interacts with the Next.js Frontend.
*   The Frontend sends the uploaded document to the Python Backend via a REST API.
*   The Backend uses a Document Parser to extract text based on the file type.
*   The Extracted Text is prepared for watsonx.ai using Few-Shot Prompts.
*   The Backend makes an API Request to IBM watsonx.ai with the text and prompt.
*   IBM watsonx.ai performs sentiment analysis and returns the Results.
*   The Backend processes the Results and sends a JSON Response back to the Frontend.
*   The Frontend displays the Results to the User.