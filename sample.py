import pandas as pd
import json
from flatten_json import flatten

# Sample MongoDB document as a JSON string
data = {
    "_id": {"$oid": "671e7e6c0f6f84c29fb2eaf3"},
    "username": "Radhika123",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "passwordHash": "$2b$12$3Ef6Y0/4W0r1aGJKZzkS.q3x4C/fJKl8e8hzfrO1abm0XMZVddGiW",
    "userType": ["employer", "freelancer"],
    "profilePicture": "https://example.com/profilepics/john.jpg",
    "location": {"city": "New York", "state": "NY", "country": "USA", "postalCode": "10001"},
    "bio": "A highly experienced freelancer with a background in web development and digital marketing.",
    "skills": ["JavaScript", "React", "Node.js", "SEO"],
    "languages": ["English", "Spanish"],
    "education": [
        {"institution": "New York University", "degree": "Bachelor Of Science", "fieldOfStudy": "Computer Science",
         "from": "2016-08-01T00:00:00Z", "to": "2020-05-01T00:00:00Z"}
    ],
    "ratings": {"asEmployer": {"$numberDouble": "4.5"}, "asFreelancer": {"$numberDouble": "4.7"}},
    # Add the remaining fields here, this is a partial example
}

# Flatten the document using the flatten function
flat_data = flatten(data)

# Convert lists to comma-separated strings
for key, value in flat_data.items():
    if isinstance(value, list):
        flat_data[key] = ', '.join(map(str, value))  # Join list items with commas

# Convert to DataFrame
df = pd.DataFrame([flat_data])

# Save to CSV
df.to_csv('user_data.csv', index=False)

print("Data has been saved to user_data.csv")
