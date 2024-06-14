import os
import json
import shutil

# Define paths
assets_folder = '/Users/drew/dev/abstract/cellcosmetus-gitlab/dist/assets'
sourcemaps_folder = '/Users/drew/dev/abstract/cellcosmetus-gitlab/dist/assets'
source_code_folder = '/Users/drew/dev/abstract/cellcosmetus-gitlab/src'

# Create sourcemaps folder if it doesn't exist
os.makedirs(sourcemaps_folder, exist_ok=True)

# Function to update the paths in the source code
def update_source_paths(file_path, mappings):
    with open(file_path, 'r') as file:
        content = file.read()
    for old_path in mappings:
        new_path = old_path.replace('webpack://project-x/', '../sourcemaps/')
        content = content.replace(old_path, new_path)
    with open(file_path, 'w') as file:
        file.write(content)

# Extract sourcemaps and move files
for root, dirs, files in os.walk(assets_folder):
    for file in files:
        if file.endswith('.map'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r') as f:
                data = json.load(f)
                sources = data.get('sources', [])
                for source in sources:
                    source_file_path = source.replace('webpack://project-x/', '')
                    source_full_path = os.path.join(source_code_folder, source_file_path)
                    if os.path.exists(source_full_path):
                        dest_path = os.path.join(sourcemaps_folder, source_file_path)
                        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                        shutil.move(source_full_path, dest_path)
                        print(f"Moved {source_full_path} to {dest_path}")

            # Update the source code paths
            update_source_paths(file_path, sources)

print("Sourcemaps extraction and source code update completed.")
