## Setting up Watsonx and the .env file
1. Log into Watsonx and create a new project
2. Create a new vector index and upload the PDF files from the AI-Hackathon\files directory
3. Once the vector index is created, save as it to a notebook as Deployable Flow
4. In the settings, create a new deployment space. Keep default settings.
5. Finish creating the notebook and go to the code instructions
6. Near the top, find the code that says space_id = <SPACE_ID>
7. Copy this ID and place it into the .env file where it is labeled
8. Next, find the line where it says: promoted_assets["vector_index_id"] = client.spaces.promote(VECTOR_INDEX_ID_1, VECTOR_INDEX_ID_2, SPACE_ID)
9. Copy each ID and paste it into the .env (SPACE_ID should already be filled out so you do not have to touch it).
10. For the project, copy its project ID and place it into PROJECT_KEY in the .env
11. In the Dashboard for Watsonx, create a new API key and place that into IBM_API_KEY spot in the .env
12. In an OpenAI account, create a new API key, add funds, and paste the key into OPENAI_API_KEY

## Start the backend
1. cd to server
2. Use a conda environment and python 3.12.7 like this (this will download all dependencies): conda create --name <myenv> --file requirements.txt python=3.12.7
5. run the backend by simply running the python file server.py

## Start the frontend
1. cd to ai-app
2. in your terminal write npm install
3. then write npm run start
4. the web app should now be running in your browser

## Things to remember:
- The .gitignore already has a lot of files ignored in it, but double check you do not push any files you do not want on the repo
- If there are any issues when running npm, perform npm audit fix --force to fix any dependency issues
