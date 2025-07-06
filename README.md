# Legal Sentiment Analysis ⚖️

[![Project Status](https://img.shields.io/badge/Status-In%20Progress-yellow)](https://github.com/your-username/legal-sentiment-analysis)
[![License](https://img.shields.io/badge/License-MIT-green)](https://opensource.org/licenses/MIT)
[![Built with Love](https://img.shields.io/badge/Built%20with-%E2%9D%A4%EF%B8%8F-ff69b4)](https://github.com/your-username/legal-sentiment-analysis)

## ✨ Project Purpose

This project aims to provide a tool for analyzing the sentiment expressed within legal texts. By leveraging natural language processing techniques, it helps identify and quantify the emotional tone (positive, negative, neutral) present in legal documents, which can be valuable for various applications such as case analysis, contract review, or legal research.

## 🚀 Features

- Upload or input legal text for analysis.
- Receive sentiment scores (e.g., positive, negative, neutral).
- Visualize sentiment distribution within the text.
- API endpoint for programmatic access to sentiment analysis.

## 🛠️ Tech Stack ✨

This project is built as a monorepo using [pnpm](https://pnpm.io/) and [TurboRepo](https://turbo.build/).

**Frontend (Web Application):**

- [Next.js](https://nextjs.org/) (React Framework)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) (for styling)
- Shared UI components (`packages/ui`)
- Dependencies: `framer-motion`, `lucide-react`, `next-themes`, `react`, `react-dom`

**Backend (API):**

- [Python](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/) (Web Framework)
- [IBM watsonx AI](https://www.ibm.com/watsonx)
- Dependencies: `fastapi`, `uvicorn`, `ibm-watsonx-ai`, `python-docx`, `PyPDF2`, `pandas`, `docx`

**Shared UI Components (`packages/ui`):**

- Dependencies: `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `lucide-react`, `next-themes`, `react`, `react-dom`, `tailwind-merge`, `tw-animate-css`, `zod`

**Development Dependencies (Root):**

- `@workspace/eslint-config`, `@workspace/typescript-config`, `prettier`, `turbo`, `typescript`

## 📂 Project Structure

The project follows a monorepo structure managed by pnpm and TurboRepo:

- `apps/`: Contains the main applications.
  - `api/`: The Python backend API.
  - `web/`: The Next.js frontend web application.
- `packages/`: Contains shared code and configurations.
  - `eslint-config/`: Shared ESLint configurations.
  - `typescript-config/`: Shared TypeScript configurations.
  - `ui/`: Shared UI components (e.g., React components).

## ⚙️ Setup and Installation 🚀

Getting this project up and running is easy! Just follow these steps:

### What You Need (Prerequisites) ✨

Make sure you have these installed on your computer:

- **Node.js:** You'll need this for the frontend and some helpful tools. Get it from [nodejs.org](https://nodejs.org/).
- **Python:** This is for the backend part of the project. Download it from [python.org](https://www.python.org/).
- **Docker (Optional):** If you prefer using containers, get Docker from [docker.com](https://www.docker.com/).
- **uv (Optional):** If you want to use `uv` for Python dependency management, you can install it by following the instructions on the [uv GitHub page](https://github.com/astral-sh/uv).

### Setting Up Locally 💻

1.  **Get the code:**

    ```bash
    git clone https://github.com/codex-mohan/legal-sentiment-analysis.git
    cd legal-sentiment-analysis
    ```

2.  **Install pnpm:** We use pnpm to manage project dependencies. If you don't have it, install it globally:

    ```bash
    npm install -g pnpm
    ```

3.  **Install all dependencies:** This command installs everything needed for both the frontend (using pnpm) and backend (using python venv and pip).

    ```bash
    pnpm install-deps
    ```

4.  **Setup API Environment:**

    - Go into the API folder: `cd apps/api`
    - Create a `.env` file. You might find an example like `.env.example` to help you.
    - This project uses `uv` for Python dependency management. Ensure you have `uv` installed if you plan to use `uv` commands directly.
    - If you prefer to install Python dependencies manually using `uv`, run: `uv pip install -r requirements.txt`
    - You can also continue using `python-venv` if you want a more vanilla, simpler approach.

5.  **Build and Run the Project:**
    - Go back to the main project folder: `cd ../..`
    - Build the project:
      ```bash
      pnpm build
      ```
    - Start the development servers:
      ```bash
      pnpm dev
      ```
    - The website will be at `http://localhost:3000` and the API at `http://localhost:8000`.

### Using Docker (Another Option) 🐳

If you like using Docker, here's how:

1.  **Build the Docker image:**
    ```bash
    docker build -t legal-sentiment-analysis .
    ```
2.  **Run the Docker container:**
    ```bash
    docker run -p 3000:3000 -p 8000:8000 legal-sentiment-analysis
    ```

## 💡 Ideas for the Future

- Integration with different sentiment analysis models.
- Support for various legal document formats (PDF, DOCX, etc.).
- User authentication and profile management.
- Database integration to store analysis results.
- Advanced visualizations and reporting.
- Fine-tuning models on specific legal datasets.
- Adding support for other languages.

## Contributing

Contributions are welcome! Please follow the standard GitHub flow: fork the repository, create a branch, make your changes, and open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
