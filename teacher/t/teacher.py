import os

# Get the directory of the script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Path to the HTML template
template_path = os.path.join(script_dir, "sss.html")

# Debugging: Print the full path to the template
print("Looking for template at:", template_path)

# Check if the file exists
if not os.path.exists(template_path):
    print(f"Error: {template_path} not found.")
    exit()

# Read the template file
with open(template_path, "r", encoding="utf-8") as file:
    template = file.read()

# List of teachers
teacher_list = [
    ("08936058-e39e-4acb-9b50-cb6edf262df5", "Rekha Saaru"),
    ("0b24bce8-2c6e-43c1-8a45-0788c6470c83", "Kamala Neupane"),
    ("13f14cf6-1cd6-4437-815f-a61d037c336e", "Usha Poudel"),
    ("25aaf545-3146-4cbc-a5c7-2321696d92e4", "Kushum Malla"),
    ("2abe9276-6753-4f42-bc89-598fbf23b77e", "Chhabi Lal Bhandari"),
    ("3211076b-e207-4e0c-b41d-bacc4481fa98", "Manisha Nepali"),
    ("324b63d8-f923-47c4-98fe-af8111503bc3", "Tika Poudel"),
    ("42e6ad40-8fb2-48f6-af43-70f378070dc4", "Seema Sinjali"),
    ("4aa65e82-3f34-453e-9dc3-a0a3349485fe", "Sangye Palden Bohora"),
    ("4dce5aba-52d6-47e9-8659-b633b0cdfe33", "Krishna Thapa"),
    ("5dc3ead2-e0a6-4c77-92ea-53d1b87d4335", "Khagisara Jaishi"),
    ("6d1e8516-764c-41a7-adcb-37cec0dfdd61", "Basundhara Wagle"),
    ("7d4e75f2-d702-4a4d-96ca-dd9881bd532a", "Thuma Baigar"),
    ("834a06f7-dcea-4dda-a9b7-78af6b76cff1", "Sushma Gurung"),
    ("8b8ecec4-6c2e-4859-8a0d-6a1bd2e76291", "Anjana Thapa Magar"),
    ("9a31d6b7-5358-4268-b365-483c0c6b2a6e", "Hikmat Soni"),
    ("d09004f0-e3c1-4701-959c-329b8887f7f3", "Chandra Gurung"),
    ("d622c5e5-b21e-49cc-b296-4bfd62e85531", "Subash Neupane"),
    ("e5d73dc4-61ed-496e-9aef-a207fa75cc15", "Sunita Dhakal"),
    ("e6883468-4226-4d2b-9b2a-11dfb822fb51", "Tapendra Bohora"),
    ("ee193e19-1698-456f-9a87-edae6568ddda", "Pramila Rawal"),
]


# Generate files
for teacher_id, teacher_name in teacher_list:
    # Replace the placeholder for TEACHER_ID in the JavaScript line
    modified_content = template.replace(
        "const TEACHER_ID = '...';",
        f"const TEACHER_ID = '{teacher_id}';"
    )

    # Generate the new file name with hyphens in the teacher's name
    teacher_name_hyphenated = teacher_name.replace(" ", "-")
    new_file_name = os.path.join(script_dir, f"{teacher_name_hyphenated}.html")

    # Write the modified content to a new file
    with open(new_file_name, "w", encoding="utf-8") as new_file:
        new_file.write(modified_content)
    print(f"Generated file: {new_file_name}")
