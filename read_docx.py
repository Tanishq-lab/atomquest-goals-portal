import zipfile
import xml.etree.ElementTree as ET
import sys

def read_docx(path):
    try:
        with zipfile.ZipFile(path, 'r') as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            text = []
            for p in tree.findall('.//w:p', namespaces=ns):
                texts = [node.text for node in p.findall('.//w:t', namespaces=ns) if node.text]
                if texts:
                    text.append(''.join(texts))
            sys.stdout.reconfigure(encoding='utf-8')
            print('\n'.join(text))
    except Exception as e:
        print(f"Error: {e}")

if len(sys.argv) > 1:
    read_docx(sys.argv[1])
