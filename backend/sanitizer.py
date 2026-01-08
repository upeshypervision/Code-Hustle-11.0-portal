"""
Security sanitization utilities for user input
Prevents XSS and injection attacks
"""
import bleach
import html
from typing import Any, Dict, List, Optional

# Allowed HTML tags (very restrictive for security)
ALLOWED_TAGS = []  # No HTML tags allowed
ALLOWED_ATTRIBUTES = {}

# Maximum lengths for various fields
MAX_LENGTHS = {
    "name": 100,
    "email": 100,
    "phone": 15,
    "bio": 500,
    "team_name": 100,
    "team_bio": 1000,
    "sapid": 20,
    "college_name": 200
}

def sanitize_string(text: str, max_length: Optional[int] = None, field_name: str = "text") -> str:
    """
    Sanitize a string by removing HTML tags and escaping special characters.
    
    Args:
        text: The text to sanitize
        max_length: Maximum allowed length (optional)
        field_name: Name of the field for length lookup
        
    Returns:
        Sanitized string
    """
    if not isinstance(text, str):
        text = str(text)
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    # Use bleach to clean HTML tags
    text = bleach.clean(text, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True)
    
    # Escape HTML entities for extra safety
    text = html.escape(text, quote=True)
    
    # Apply length limit
    if max_length is None and field_name in MAX_LENGTHS:
        max_length = MAX_LENGTHS[field_name]
    
    if max_length and len(text) > max_length:
        text = text[:max_length]
    
    return text

def sanitize_email(email: str) -> str:
    """
    Sanitize email address.
    
    Args:
        email: Email address to sanitize
        
    Returns:
        Sanitized email
    """
    email = sanitize_string(email, field_name="email")
    # Additional email-specific validation could be added here
    return email.lower()

def sanitize_phone(phone: str) -> str:
    """
    Sanitize phone number (digits only).
    
    Args:
        phone: Phone number to sanitize
        
    Returns:
        Sanitized phone number
    """
    # Remove all non-digit characters
    phone = ''.join(filter(str.isdigit, phone))
    return sanitize_string(phone, field_name="phone")

def sanitize_team_data(team_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize all fields in team registration data.
    
    Args:
        team_data: Dictionary containing team data
        
    Returns:
        Sanitized team data dictionary
    """
    sanitized = {}
    
    # Sanitize top-level fields
    if "tName" in team_data:
        sanitized["tName"] = sanitize_string(team_data["tName"], field_name="team_name")
    
    if "tBio" in team_data:
        sanitized["tBio"] = sanitize_string(team_data["tBio"], field_name="team_bio")
    
    if "lName" in team_data:
        sanitized["lName"] = sanitize_string(team_data["lName"], field_name="name")
    
    if "lAbout" in team_data:
        sanitized["lAbout"] = sanitize_string(team_data["lAbout"], field_name="bio")
    
    if "email" in team_data:
        sanitized["email"] = sanitize_email(team_data["email"])
    
    if "phone" in team_data:
        sanitized["phone"] = sanitize_phone(team_data["phone"])
    
    if "sap" in team_data:
        sanitized["sap"] = sanitize_string(team_data["sap"], field_name="sapid")
    
    if "universityType" in team_data:
        sanitized["universityType"] = sanitize_string(team_data["universityType"], max_length=50)
    
    # Sanitize member data
    for i in range(1, 5):
        m_key = f"m{i}"
        if m_key in team_data and isinstance(team_data[m_key], dict):
            sanitized[m_key] = {}
            member = team_data[m_key]
            
            if "fullName" in member:
                sanitized[m_key]["fullName"] = sanitize_string(member["fullName"], field_name="name")
            
            if "bio" in member:
                sanitized[m_key]["bio"] = sanitize_string(member["bio"], field_name="bio")
            
            if "email" in member:
                sanitized[m_key]["email"] = sanitize_email(member["email"])
            
            if "phone" in member:
                sanitized[m_key]["phone"] = sanitize_phone(member["phone"])
            
            if "sapid" in member:
                sanitized[m_key]["sapid"] = sanitize_string(member["sapid"], field_name="sapid")
            
            if "universityType" in member:
                sanitized[m_key]["universityType"] = sanitize_string(member["universityType"], max_length=50)
    
    return sanitized

def sanitize_output_data(data: Any) -> Any:
    """
    Recursively sanitize data before sending to frontend.
    
    Args:
        data: Data to sanitize (can be dict, list, or primitive)
        
    Returns:
        Sanitized data
    """
    if isinstance(data, dict):
        return {key: sanitize_output_data(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_output_data(item) for item in data]
    elif isinstance(data, str):
        # For output, we escape but don't strip length (already in DB)
        return html.escape(data, quote=True)
    else:
        return data
