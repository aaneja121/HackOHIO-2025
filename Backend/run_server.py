import uvicorn
import os

if __name__ == "__main__":
    # Ensure we are in the correct directory (the parent of app/) works best
    # but since this file is IN Backend/, we can run it from here.
    
    print("Starting Healios Backend...")
    print("Docs available at: http://localhost:8000/docs")
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
