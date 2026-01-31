import os
import sys
from bs4 import BeautifulSoup

def audit_assets(root_dir):
    violations_found = False

    for dirpath, _, filenames in os.walk(root_dir):
        if '.git' in dirpath:
            continue
        for filename in filenames:
            if filename.endswith(".html"):
                filepath = os.path.join(dirpath, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        soup = BeautifulSoup(f, 'html.parser')
                        # print(f"Checking {filepath}...")

                        for script in soup.find_all('script'):
                            src = script.get('src')
                            if src:
                                if 'tailwind' in src or 'cdn.tailwindcss.com' in src:
                                    print(f"VIOLATION in {filepath}: Script src uses Tailwind: {src}")
                                    violations_found = True
                            else:
                                content = script.string
                                if content and ('tailwind' in content):
                                    print(f"VIOLATION in {filepath}: Inline script mentions Tailwind")
                                    violations_found = True

                        for link in soup.find_all('link'):
                            href = link.get('href')
                            if href and ('tailwind' in href or 'cdn.tailwindcss.com' in href):
                                print(f"VIOLATION in {filepath}: Link href uses Tailwind: {href}")
                                violations_found = True

                        for style in soup.find_all('style'):
                            content = style.string
                            if content and ('@tailwind' in content):
                                print(f"VIOLATION in {filepath}: Style block uses @tailwind")
                                violations_found = True
                            if content and ('cdn.tailwindcss.com' in content):
                                print(f"VIOLATION in {filepath}: Style block mentions Tailwind CDN")
                                violations_found = True

                except Exception as e:
                    print(f"Error reading {filepath}: {e}")

    if violations_found:
        print("FAIL: Tailwind CSS usage detected.")
        sys.exit(1)
    else:
        print("SUCCESS: No Tailwind CSS usage detected.")
        sys.exit(0)

if __name__ == "__main__":
    audit_assets(".")
