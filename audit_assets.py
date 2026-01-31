import os
from bs4 import BeautifulSoup

def audit_assets(root_dir):
    for dirpath, _, filenames in os.walk(root_dir):
        if '.git' in dirpath:
            continue
        for filename in filenames:
            if filename.endswith(".html"):
                filepath = os.path.join(dirpath, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        soup = BeautifulSoup(f, 'html.parser')
                        print(f"--- {filepath} ---")
                        for script in soup.find_all('script'):
                            if script.get('src'):
                                print(f"  SCRIPT SRC: {script.get('src')}")
                            else:
                                content = script.string
                                if content and ('tailwind' in content or 'cdn' in content):
                                    print(f"  INLINE SCRIPT MATCH: {content[:100]}...")

                        for link in soup.find_all('link'):
                            print(f"  LINK HREF: {link.get('href')}")

                        for style in soup.find_all('style'):
                            content = style.string
                            if content and ('@tailwind' in content or '@import' in content):
                                print(f"  STYLE MATCH: {content[:100]}...")

                except Exception as e:
                    print(f"Error reading {filepath}: {e}")

if __name__ == "__main__":
    audit_assets(".")
