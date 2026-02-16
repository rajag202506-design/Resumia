#!/usr/bin/env python3
"""
Test script for improved suggestion system
"""

import requests
import json

# Test resume samples
test_resumes = [
    {
        "name": "Minimal Resume (Low Score)",
        "text": """
        John Doe
        Software Developer
        I worked on various projects using Python.
        """
    },
    {
        "name": "Good Resume Missing Contact",
        "text": """
        Jane Smith
        Senior Software Engineer

        Experience:
        Led development of microservices architecture using Node.js and React
        Implemented CI/CD pipelines reducing deployment time by 40%
        Managed team of 5 developers

        Skills: JavaScript, React, Node.js, Docker, AWS

        Education:
        BS Computer Science, Stanford University
        """
    },
    {
        "name": "Excellent Resume",
        "text": """
        Alex Johnson
        alex.johnson@email.com | +1-234-567-8900 | linkedin.com/in/alexjohnson

        Professional Summary:
        Senior Full Stack Developer with 8+ years of experience building scalable web applications

        Experience:
        Senior Software Engineer | Tech Corp | 2020-Present
        - Developed microservices architecture serving 1M+ users, improving response time by 45%
        - Led migration to AWS cloud infrastructure, reducing costs by $200K annually
        - Implemented ML-based recommendation engine increasing user engagement by 30%
        - Managed team of 8 engineers across 3 time zones

        Software Engineer | StartupXYZ | 2017-2020
        - Built real-time analytics dashboard processing 10M events/day using React and Node.js
        - Designed RESTful APIs serving 500K requests/day with 99.9% uptime
        - Reduced database query time by 60% through optimization and caching strategies

        Skills:
        JavaScript, TypeScript, React, Node.js, Python, Java, MongoDB, PostgreSQL, AWS, Docker, Kubernetes, Git, CI/CD, GraphQL, Redis, Elasticsearch

        Education:
        BS Computer Science | MIT | 2017 | GPA: 3.9/4.0

        Certifications:
        AWS Certified Solutions Architect, Google Cloud Professional

        Projects:
        - E-commerce Platform: Built full-stack application handling 100K daily transactions
        - Open Source Contributor: 500+ commits to popular JavaScript libraries
        """
    }
]

def test_api(resume_data):
    """Test the Flask API with resume data"""
    print(f"\n{'='*80}")
    print(f"Testing: {resume_data['name']}")
    print('='*80)

    try:
        response = requests.post(
            'http://localhost:5000/analyze-text',
            json={'text': resume_data['text']},
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            analysis = data.get('analysis', {})

            print(f"\n📊 SCORE: {analysis.get('score', 'N/A')}/10")

            print(f"\n📧 CONTACT INFO:")
            contact = analysis.get('contactInfo', {})
            print(f"  Emails: {len(contact.get('emails', []))} found")
            print(f"  Phones: {len(contact.get('phones', []))} found")
            print(f"  LinkedIn: {len(contact.get('linkedin', []))} found")

            print(f"\n🔑 KEYWORDS: {len(analysis.get('keywords', {}))} technical skills found")
            if analysis.get('keywords'):
                top_keywords = list(analysis['keywords'].items())[:5]
                for skill, count in top_keywords:
                    print(f"  - {skill}: {count}x")

            print(f"\n⚠️  ISSUES DETECTED: {len(analysis.get('issues', []))}")
            for issue in analysis.get('issues', []):
                print(f"  • {issue}")

            print(f"\n💡 SPECIFIC SUGGESTIONS: {len(analysis.get('suggestions', []))}")
            for i, suggestion in enumerate(analysis.get('suggestions', []), 1):
                print(f"  {i}. {suggestion}")

            print(f"\n✅ Test passed for: {resume_data['name']}")

        else:
            print(f"❌ API returned status {response.status_code}")
            print(f"Response: {response.text}")

    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to Flask API at http://localhost:5000")
        print("Make sure the Flask server is running: python app.py")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    print("\n🧪 TESTING IMPROVED SUGGESTION SYSTEM")
    print("=" * 80)

    # Test health check first
    try:
        health = requests.get('http://localhost:5000/', timeout=5)
        if health.status_code == 200:
            print("✅ Flask API is running")
            print(f"Service: {health.json().get('service', 'Unknown')}")
            print(f"Version: {health.json().get('version', 'Unknown')}")
        else:
            print("⚠️  API responded but health check failed")
    except:
        print("❌ Flask API is not running. Start it with: python app.py")
        exit(1)

    # Test each resume
    for resume in test_resumes:
        test_api(resume)

    print(f"\n{'='*80}")
    print("🎉 All tests completed!")
    print('='*80)
