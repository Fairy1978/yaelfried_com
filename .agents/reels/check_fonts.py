import collections
import re
import shutil
import sys
import zipfile

src, dst = sys.argv[1], sys.argv[2]
shutil.copyfile(src, dst)
z = zipfile.ZipFile(dst)
parts = [n for n in z.namelist() if n.endswith(".xml")]
bad = [n for n in parts if "arial" in z.read(n).decode("utf8", "ignore").lower()]
print("Arial in:", bad or "nowhere")
doc = z.read("word/document.xml").decode()
print("explicit fonts in text:", collections.Counter(re.findall(r'w:cs="([^"]+)"', doc)).most_common()
      or "none, inherited from the document styles")
theme = z.read("word/theme/theme1.xml").decode()
print("theme fonts:", re.findall(r'<a:latin typeface="([^"]*)"', theme)[:2],
      re.findall(r'<a:cs typeface="([^"]*)"', theme)[:2])
