import os
import sys
from bs4 import BeautifulSoup


def audit_assets(root_dir):
    found = False
    for dirpath, _, filenames in os.walk(root_dir):
        if '.git' in dirpath:
            continue
        for filename in filenames:
            if filename.endswith(".html"):
                filepath = os.path.join(dirpath, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        soup = BeautifulSoup(f, 'html.parser')
                        for script in soup.find_all('script'):
                            src = script.get('src')
                            if src and ('tailwind' in src or 'cdn.tailwindcss.com' in src or 'cdn' in src and 'tailwind' in src):
                                print(f"TAILWIND CDN FOUND in {filepath} -> script src: {src}")
                                found = True
                            else:
                                content = script.string
                                if content and ('tailwind' in content or 'cdn.tailwindcss.com' in content):
                                    snippet = content.strip().replace('\n', ' ')[:200]
                                    print(f"INLINE SCRIPT MATCH in {filepath}: {snippet}...")
                                    found = True

                        for link in soup.find_all('link'):
                            href = link.get('href')
                            if href and ('tailwind' in href or 'cdn.tailwindcss.com' in href or 'rawcdn.githack.com' in href):
                                print(f"TAILWIND LINK FOUND in {filepath} -> link href: {href}")
                                found = True

                        for style in soup.find_all('style'):
                            content = style.string
                            if content and ('@tailwind' in content or '@import' in content and 'tailwind' in content):
                                snippet = content.strip().replace('\n', ' ')[:200]
                                print(f"STYLE MATCH in {filepath}: {snippet}...")
                                found = True

                except Exception as e:
                    print(f"Error reading {filepath}: {e}")

    return found


if __name__ == "__main__":
    has_issue = audit_assets(".")
    if has_issue:
        print("Tailwind or CDN usage detected. Failing audit.")
        sys.exit(1)
    else:
        print("No Tailwind or CDN usage detected. Audit passed.")
        sys.exit(0)
