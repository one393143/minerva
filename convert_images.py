
import os
from PIL import Image
import concurrent.futures

def convert_to_webp(file_path):
    """
    Converts a single PNG file to WebP format.
    """
    try:
        # Construct new filename
        file_root, _ = os.path.splitext(file_path)
        output_path = f"{file_root}.webp"

        # Skip if already exists
        if os.path.exists(output_path):
            print(f"Skipping (already exists): {output_path}")
            return

        print(f"Converting: {file_path} -> {output_path}")
        
        # Open and convert
        with Image.open(file_path) as image:
            # Save as WebP (Lossless to preserve quality and transparency)
            image.save(output_path, "WEBP", lossless=True, quality=100)
            
    except Exception as e:
        print(f"Error converting {file_path}: {e}")

def batch_convert(directory="."):
    """
    Recursively finds all PNG files and converts them.
    """
    png_files = []
    
    # Walk through directory
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(".png"):
                full_path = os.path.join(root, file)
                png_files.append(full_path)

    if not png_files:
        print("No PNG files found in this directory.")
        return

    print(f"Found {len(png_files)} PNG files. Starting conversion...")

    # Use parallel processing for speed
    with concurrent.futures.ThreadPoolExecutor() as executor:
        executor.map(convert_to_webp, png_files)

    print("\nConversion Complete! 🎉")
    print("Optimization Tip: Remember to update your code to reference .webp instead of .png")

if __name__ == "__main__":
    current_dir = os.getcwd()
    print(f"Working Directory: {current_dir}")
    batch_convert(current_dir)
