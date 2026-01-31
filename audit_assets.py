import os
import sys
import re

# Try to use BeautifulSoup when available for more precise HTML parsing,
# but fall back to a robust text-based search if bs4 isn't installed.
try:
    from bs4 import BeautifulSoup
    HAVE_BS4 = True
except Exception:
    HAVE_BS4 = False

# Patterns to look for (case-insensitive)
PATTERNS = [
    r'cdn\.tailwindcss\.com',
    r'\btailwind\b',
    r'@tailwind',
    r'rawcdn\.githack\.com'
]


def check_text_for_patterns(text, filepath):
    """Search the raw text for known Tailwind/CDN patterns and print a snippet on match."""
    for pat in PATTERNS:
        if re.search(pat, text, flags=re.IGNORECASE):
            m = re.search(r'(.{0,120}' + pat + '.{0,120})', text, flags=re.IGNORECASE)
            snippet = m.group(1).strip().replace('\n', ' ') if m else text[:240].replace('\n', ' ')
            print(f"PATTERN '{pat}' FOUND in {filepath}: ...{snippet}...")
            return True
    return False


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
                        text = f.read()

                        if HAVE_BS4:
                            soup = BeautifulSoup(text, 'html.parser')

                            # Check <script> tags
                            for script in soup.find_all('script'):
                                src = (script.get('src') or '').strip()
                                content = (script.string or '').strip()
                                if src and ("tailwind" in src.lower() or "cdn.tailwindcss.com" in src.lower()):
                                    print(f"TAILWIND CDN FOUND in {filepath} -> script src: {src}")
                                    found = True
                                elif content and ("tailwind" in content.lower() or "cdn.tailwindcss.com" in content.lower()):
                                    snippet = content.replace('\n', ' ')[:200]
                                    print(f"INLINE SCRIPT MATCH in {filepath}: {snippet}...")
                                    found = True

                            # Check <link> tags
                            for link in soup.find_all('link'):
                                href = (link.get('href') or '').strip()
                                if href and ("tailwind" in href.lower() or "cdn.tailwindcss.com" in href.lower() or "rawcdn.githack.com" in href.lower()):
                                    print(f"TAILWIND LINK FOUND in {filepath} -> link href: {href}")
                                    found = True

                            # Check <style> blocks
                            for style in soup.find_all('style'):
                                content = (style.string or '').strip()
                                if content and ("@tailwind" in content.lower() or ("@import" in content.lower() and "tailwind" in content.lower())):
                                    snippet = content.replace('\n', ' ')[:200]
                                    print(f"STYLE MATCH in {filepath}: {snippet}...")
                                    found = True

                        else:
                            # Fallback: raw text scan (works without external deps)
                            if check_text_for_patterns(text, filepath):
                                found = True

                except Exception as e:
                    print(f"Error reading {filepath}: {e}")

    return found


if __name__ == "__main__":
    if not HAVE_BS4:
        print("Note: 'bs4' (BeautifulSoup) not available; falling back to plain text scanning.")

    has_issue = audit_assets(".")
    if has_issue:
        print("Tailwind or CDN usage detected. Failing audit.")
        sys.exit(1)
    else:
        print("No Tailwind or CDN usage detected. Audit passed.")
        sys.exit(0)
