import os
import tempfile
import uuid
import shutil

TEMP_DIR = os.path.join(tempfile.gettempdir(), "pdf_tools")
os.makedirs(TEMP_DIR, exist_ok=True)


def get_temp_dir():
    """Create a unique temporary directory for a job."""
    job_id = str(uuid.uuid4())
    job_dir = os.path.join(TEMP_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)
    return job_dir


def cleanup_dir(dir_path):
    """Remove a temporary directory."""
    try:
        if os.path.exists(dir_path):
            shutil.rmtree(dir_path)
    except Exception:
        pass


async def save_upload(file, dir_path, filename=None):
    """Save an uploaded file to the given directory."""
    fname = filename or file.filename
    filepath = os.path.join(dir_path, fname)
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)
    return filepath
