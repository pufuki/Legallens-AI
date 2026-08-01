import os
import zipfile
import xml.sax.saxutils as saxutils

def text_to_docx(text, output_path):
    content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>'''

    rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''

    body_xml = []
    for line in text.splitlines():
        escaped = saxutils.escape(line)
        body_xml.append(f'<w:p><w:r><w:t>{escaped}</w:t></w:r></w:p>')

    document_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {''.join(body_xml)}
  </w:body>
</w:document>'''

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('[Content_Types].xml', content_types)
        zf.writestr('_rels/.rels', rels)
        zf.writestr('word/document.xml', document_xml)

sample_dir = 'backend/sample_data/sample_contracts'
out_dir = 'public/sample_contracts'
os.makedirs(out_dir, exist_ok=True)

for fname in os.listdir(sample_dir):
    if fname.endswith('.txt'):
        txt_path = os.path.join(sample_dir, fname)
        docx_name = fname.replace('.txt', '.docx')
        docx_path = os.path.join(out_dir, docx_name)
        with open(txt_path, 'r', encoding='utf-8') as f:
            text = f.read()
        text_to_docx(text, docx_path)
        print(f"Created: {docx_path}")

