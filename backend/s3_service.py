import boto3
from config import S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
import logging

logger = logging.getLogger(__name__)

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def upload_file_to_s3(file_content, file_key, content_type):
    """
    Uploads file content to S3.

    Args:
        file_content (bytes): The binary content of the file.
        file_key (str): The key (name) for the file in the S3 bucket.
        content_type (str): The MIME type of the file (e.g., 'application/pdf').

    Returns:
        str: The S3 URL of the uploaded file if successful, None otherwise.
    """
    try:
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=file_key,
            Body=file_content,
            ContentType=content_type
        )
        # Construct the public URL (adjust if using CloudFront or a custom domain)
        s3_url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{file_key}"
        logger.info(f"File uploaded successfully to {s3_url}")
        return s3_url
    except Exception as e:
        logger.error(f"Error uploading file to S3: {e}")
        return None

# File validation logic can also be here if desired, but often sits in the controller layer
ALLOWED_EXTENSIONS = {'pdf', 'ppt', 'pptx'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def is_valid_file_size(file):
    """Check if the file size is within the limit."""
    file.seek(0, 2)  # Seek to end of file
    size = file.tell()
    file.seek(0)  # Seek back to beginning
    return size <= MAX_FILE_SIZE

CONTENT_TYPE_MAP = {
    'pdf': 'application/pdf',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
}

def get_content_type(filename):
    """Get the content type for S3 based on file extension."""
    ext = filename.rsplit('.', 1)[1].lower()
    return CONTENT_TYPE_MAP.get(ext, 'application/octet-stream')