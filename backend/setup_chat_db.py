"""
Database setup script for chat messages collection
Run this once to create the necessary indexes for optimal performance
"""
from database import get_db

def setup_chat_indexes():
    """Create indexes for chat_messages collection"""
    db = get_db()
    
    print("Creating indexes for chat_messages collection...")
    
    # Index for fetching messages by conversation (most common query)
    db.chat_messages.create_index([
        ("conversation_id", 1),
        ("timestamp", 1)
    ], name="conversation_timestamp_idx")
    
    # Index for counting unread messages
    db.chat_messages.create_index([
        ("conversation_id", 1),
        ("read", 1)
    ], name="conversation_read_idx")
    
    # Index for finding latest message per conversation
    db.chat_messages.create_index([
        ("conversation_id", 1),
        ("timestamp", -1)
    ], name="conversation_latest_idx")
    
    print("✓ Indexes created successfully!")
    print("\nCreated indexes:")
    print("  - conversation_timestamp_idx: for fetching chat history")
    print("  - conversation_read_idx: for counting unread messages")
    print("  - conversation_latest_idx: for getting last message")

if __name__ == "__main__":
    setup_chat_indexes()
