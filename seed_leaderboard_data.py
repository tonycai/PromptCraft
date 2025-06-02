#!/usr/bin/env python3
"""
Simple script to seed the database with sample data for leaderboard testing.
This creates sample users and submissions to make the leaderboard more interesting.
"""

import sys
import os
sys.path.append('/root/workspace/PromptCraft')

from promptcraft.database.db_handler import DatabaseHandler
from promptcraft.auth_utils import get_password_hash
import random
from datetime import datetime, timedelta

def seed_leaderboard_data():
    """Create sample data for leaderboard testing."""
    db_handler = DatabaseHandler()
    
    # Sample user data
    sample_users = [
        ("alice@example.com", "alice", "Alice Johnson", "Expert prompt engineer with 5+ years experience"),
        ("bob@example.com", "bob", "Bob Smith", "AI researcher and prompt optimization specialist"),
        ("charlie@example.com", "charlie", "Charlie Brown", "Creative writer exploring AI-assisted content"),
        ("diana@example.com", "diana", "Diana Prince", "Data scientist passionate about language models"),
        ("eve@example.com", "eve", "Eve Thompson", "Machine learning engineer and prompt designer"),
    ]
    
    # Sample prompts for different complexity levels
    sample_prompts = [
        "Write a hello world program",
        "Create a function that calculates the factorial of a number using recursion",
        "Implement a binary search algorithm with proper error handling and documentation",
        "Design a REST API for a todo application with authentication and CRUD operations",
        "Build a machine learning pipeline for text classification with proper validation and testing",
        "Develop a microservices architecture for an e-commerce platform with monitoring and logging",
    ]
    
    # Sample generated code (different qualities)
    sample_codes = [
        'print("Hello, World!")',
        '''
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
''',
        '''
def binary_search(arr, target):
    """
    Perform binary search on a sorted array.
    
    Args:
        arr: Sorted list of comparable elements
        target: Element to search for
    
    Returns:
        int: Index of target if found, -1 otherwise
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1
''',
        '''
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
import sqlite3

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
jwt = JWTManager(app)

@app.route('/api/todos', methods=['GET'])
@jwt_required()
def get_todos():
    conn = sqlite3.connect('todos.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM todos')
    todos = cursor.fetchall()
    conn.close()
    return jsonify(todos)

@app.route('/api/todos', methods=['POST'])
@jwt_required()
def create_todo():
    data = request.get_json()
    # Implementation here
    return jsonify({'message': 'Todo created'}), 201
''',
    ]
    
    try:
        print("🌱 Seeding leaderboard data...")
        
        # Check if we already have enough users
        conn = db_handler.connect()
        if not conn:
            print("❌ Failed to connect to database")
            return
            
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM users WHERE is_active = TRUE AND is_verified = TRUE")
        user_count = cursor.fetchone()[0]
        cursor.close()
        db_handler.close()
        
        print(f"📊 Current verified users: {user_count}")
        
        created_users = []
        
        # Create sample users if needed
        if user_count < 5:
            print("👥 Creating sample users...")
            for email, username, full_name, _ in sample_users:
                # Check if user already exists
                existing_user = db_handler.get_user_by_username(username)
                if existing_user:
                    created_users.append(existing_user)
                    print(f"✅ User {username} already exists")
                    continue
                
                # Create new user
                hashed_password = get_password_hash("password123")
                user_id = db_handler.create_user(
                    email=email,
                    username=username,
                    hashed_password=hashed_password,
                    full_name=full_name
                )
                
                if user_id:
                    # Mark user as verified
                    db_handler.set_user_verified(user_id)
                    user_data = db_handler.get_user_by_id(user_id)
                    created_users.append(user_data)
                    print(f"✅ Created user: {username}")
        
        # Get existing users (reconnect to database)
        conn = db_handler.connect()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE is_active = TRUE AND is_verified = TRUE LIMIT 10")
        if not created_users:
            created_users = cursor.fetchall()
        cursor.close()
        db_handler.close()
        
        # Create sample questions if they don't exist (reconnect to database)
        conn = db_handler.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM questions")
        question_count = cursor.fetchone()[0]
        
        if question_count == 0:
            print("❓ Creating sample questions...")
            for i, prompt in enumerate(sample_prompts):
                question_id = db_handler.add_question(
                    description=f"Challenge {i+1}: {prompt}",
                    expected_outcome="Working code that solves the problem",
                    evaluation_criteria=["Correctness", "Code Quality", "Documentation"],
                    programming_language="Python",
                    difficulty_level=["Beginner", "Intermediate", "Advanced"][i % 3]
                )
                print(f"✅ Created question {question_id}")
        
        cursor.close()
        db_handler.close()
        
        # Get available questions (reconnect to database)
        conn = db_handler.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM questions LIMIT 10")
        question_ids = [row[0] for row in cursor.fetchall()]
        
        # Create sample submissions
        cursor.execute("SELECT COUNT(*) as count FROM submissions")
        submission_count = cursor.fetchone()[0]
        
        print(f"📝 Current submissions: {submission_count}")
        
        if submission_count < 20:
            print("📝 Creating sample submissions...")
            for user in created_users[:5]:  # Use first 5 users
                user_id = user['id'] if isinstance(user, dict) else user[0]
                # Create 3-7 submissions per user
                num_submissions = random.randint(3, 7)
                
                for _ in range(num_submissions):
                    question_id = random.choice(question_ids)
                    prompt = random.choice(sample_prompts)
                    generated_code = random.choice(sample_codes)
                    
                    submission_id = db_handler.create_submission(
                        user_id=user_id,
                        question_id=question_id,
                        prompt=prompt,
                        generated_code=generated_code
                    )
                    
                    if submission_id:
                        print(f"✅ Created submission {submission_id} for user {user_id}")
        
        cursor.close()
        db_handler.close()
        
        print("🎉 Leaderboard data seeding completed!")
        print("🏆 Users can now see rankings and compete with each other!")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    seed_leaderboard_data()