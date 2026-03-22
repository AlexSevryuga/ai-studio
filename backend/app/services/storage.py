"""Cloudflare R2 storage service."""

import uuid
from typing import Any

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.config import settings


def get_r2_client() -> Any:
    """Get R2 S3-compatible client."""
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
    )


def upload_file(file: Any, path: str) -> str:
    """Upload file to R2 and return URL.

    Args:
        file: File-like object to upload
        path: Destination path in R2 bucket (e.g., "uploads/project-123/book.txt")

    Returns:
        Public URL of uploaded file
    """
    client = get_r2_client()
    client.put_object(
        Bucket=settings.R2_BUCKET_NAME,
        Key=path,
        Body=file,
    )
    return f"https://{settings.R2_BUCKET_NAME}.r2.dev/{path}"


def upload_file_content(content: bytes, path: str) -> str:
    """Upload file content to R2 and return URL.

    Args:
        content: File content as bytes
        path: Destination path in R2 bucket

    Returns:
        Public URL of uploaded file
    """
    client = get_r2_client()
    client.put_object(
        Bucket=settings.R2_BUCKET_NAME,
        Key=path,
        Body=content,
    )
    return f"https://{settings.R2_BUCKET_NAME}.r2.dev/{path}"


def get_presigned_url(path: str, expires_in: int = 3600) -> str:
    """Generate presigned URL for downloading a file.

    Args:
        path: Path to file in R2 bucket
        expires_in: URL expiration time in seconds (default 1 hour)

    Returns:
        Presigned URL for downloading the file
    """
    client = get_r2_client()
    url = client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.R2_BUCKET_NAME, "Key": path},
        ExpiresIn=expires_in,
    )
    return url


def delete_file(path: str) -> bool:
    """Delete file from R2.

    Args:
        path: Path to file in R2 bucket

    Returns:
        True if deleted successfully, False otherwise
    """
    client = get_r2_client()
    try:
        client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=path)
        return True
    except ClientError:
        return False


def file_exists(path: str) -> bool:
    """Check if file exists in R2.

    Args:
        path: Path to file in R2 bucket

    Returns:
        True if file exists, False otherwise
    """
    client = get_r2_client()
    try:
        client.head_object(Bucket=settings.R2_BUCKET_NAME, Key=path)
        return True
    except ClientError:
        return False


def generate_upload_path(project_id: uuid.UUID, filename: str) -> str:
    """Generate upload path for project file.

    Args:
        project_id: Project UUID
        filename: Original filename

    Returns:
        Path like "projects/{project_id}/source/{filename}"
    """
    safe_filename = "".join(c if c.isalnum() or c in ".-_" else "_" for c in filename)
    return f"projects/{project_id}/source/{safe_filename}"
