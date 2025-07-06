from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
from typing import List
import pandas as pd
import docx
import PyPDF2
from dotenv import load_dotenv

load_dotenv()

# Read watsonx.ai credentials from environment variables
WATSONX_API_KEY = os.getenv("WATSONX_API_KEY")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")
WATSONX_ENDPOINT_URL = os.getenv("WATSONX_ENDPOINT_URL", "https://us-south.ml.cloud.ibm.com") # Default endpoint

if not WATSONX_API_KEY or not WATSONX_PROJECT_ID:
    raise ValueError("WATSONX_API_KEY and WATSONX_PROJECT_ID environment variables must be set.")

# Initialize watsonx.ai client
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
# from ibm_watsonx_ai.helpers import get_foundation_model_parameters # This import is not needed with ModelInference

# Initialize watsonx.ai credentials
credentials = Credentials(
    api_key=WATSONX_API_KEY,
    url=WATSONX_ENDPOINT_URL
)

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware to allow cross-origin requests from the frontend
# In a production environment, you should restrict origins to your frontend's domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

@app.get("/")
async def read_root():
    return {"message": "Python backend is running"}

@app.post("/analyze-sentiment/")
async def analyze_sentiment(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        try:
            # Save the uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
                content = await file.read()
                tmp_file.write(content)
                tmp_file_path = tmp_file.name

            document_text = ""
            file_extension = os.path.splitext(file.filename)[1].lower()

            if file_extension in ['.txt', '.md']:
                with open(tmp_file_path, 'r', encoding='utf-8') as f:
                    document_text = f.read()
            elif file_extension == '.csv':
                import pandas as pd
                try:
                    df = pd.read_csv(tmp_file_path)
                    # Assuming text content is in all columns, concatenate them
                    document_text = df.to_string()
                except Exception as csv_e:
                    raise HTTPException(status_code=400, detail=f"Error reading CSV file: {csv_e}")
            elif file_extension == '.docx':
                import docx
                try:
                    doc = docx.Document(tmp_file_path)
                    document_text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
                except Exception as docx_e:
                     raise HTTPException(status_code=400, detail=f"Error reading DOCX file: {docx_e}")
            elif file_extension == '.pdf':
                import PyPDF2
                try:
                    with open(tmp_file_path, 'rb') as pdf_file:
                        reader = PyPDF2.PdfReader(pdf_file)
                        document_text = ""
                        for page_num in range(len(reader.pages)):
                            document_text += reader.pages[page_num].extract_text() or "" # Handle potential None from extract_text
                except Exception as pdf_e:
                    raise HTTPException(status_code=400, detail=f"Error reading PDF file: {pdf_e}")
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_extension}")

            # Define prompts for watsonx.ai
            sentiment_prompt = f"""Analyze the sentiment of the following legal text. Classify the sentiment as positive, negative, or neutral.
                                Text:
                                {document_text[:4000]} # Limit text length for prompt
                                Sentiment:"""

            summary_prompt = f"""Summarize the following legal text.

            Text:
            {document_text[:4000]} # Limit text length for prompt
            Summary:"""

            # Set model parameters
            # These parameters can be adjusted based on the chosen model and desired output
            parameters = {
                GenParams.MAX_NEW_TOKENS: 200,
                GenParams.MIN_NEW_TOKENS: 50,
                GenParams.TEMPERATURE: 0.7,
                GenParams.REPETITION_PENALTY: 1.0
            }

            # Specify the model ID (replace with the actual model ID you want to use, e.g., 'google/flan-t5-xxl', 'ibm/mistralai/mistral-7b-instruct-v0-2')
            # For this example, I'll use a placeholder. You'll need to replace 'YOUR_MODEL_ID' with a valid model ID.
            model_id = "mistralai/mixtral-8x7b-instruct-v01" # !!! REPLACE WITH ACTUAL MODEL ID !!!

            sentiment_result = "neutral" # Default in case of error
            summary_result = "Analysis failed." # Default in case of error

            try:
                # Call watsonx.ai for sentiment analysis
                # Initialize ModelInference for sentiment analysis
                sentiment_model_inference = ModelInference(
                    model_id=model_id,
                    params=parameters,
                    credentials=credentials,
                    project_id=WATSONX_PROJECT_ID
                )
                sentiment_response = sentiment_model_inference.generate_text(
                    prompt=sentiment_prompt
                )
                # Assuming the response structure contains the generated text directly
                sentiment_result = sentiment_response.strip()

            except Exception as wx_sentiment_e:
                print(f"Error during watsonx.ai sentiment analysis for {file.filename}: {wx_sentiment_e}")
                sentiment_result = f"Sentiment analysis failed: {wx_sentiment_e}"


            try:
                # Call watsonx.ai for summarization
                # Initialize ModelInference for summarization
                summary_model_inference = ModelInference(
                    model_id=model_id,
                    params=parameters,
                    credentials=credentials,
                    project_id=WATSONX_PROJECT_ID
                )
                summary_response = summary_model_inference.generate_text(
                    prompt=summary_prompt
                )
                 # Assuming the response structure contains the generated text directly
                summary_result = summary_response.strip()

            except Exception as wx_summary_e:
                print(f"Error during watsonx.ai summarization for {file.filename}: {wx_summary_e}")
                summary_result = f"Summarization failed: {wx_summary_e}"


            # Prepare the final analysis result
            analysis_result = {
                "filename": file.filename,
                "sentiment": sentiment_result,
                "summary": summary_result
            }
            results.append(analysis_result)

        except HTTPException as he:
             results.append({
                "filename": file.filename,
                "error": f"HTTP Error: {he.detail}"
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": f"Error processing file: {e}"
            })
        finally:
            # Clean up the temporary file
            if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)

    return {"results": results}

# To run this application, you would typically use a command like:
# uvicorn main:app --reload
# from the legal-sentiment-analysis/apps/api directory