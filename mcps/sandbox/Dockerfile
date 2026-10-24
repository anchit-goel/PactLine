FROM python:3.11-slim

RUN pip install --no-cache-dir \
    pandas \
    numpy \
    python-dateutil \
    typst

RUN printf '#!/usr/bin/env python3\nimport sys, typst\nif "--version" in sys.argv:\n    print(f"typst {typst.__version__}")\n    sys.exit(0)\nelif len(sys.argv) > 2 and sys.argv[1] == "compile":\n    src = sys.argv[2]\n    out = sys.argv[3] if len(sys.argv) > 3 else src.rsplit(".", 1)[0] + ".pdf"\n    typst.compile(src, output=out)\n    sys.exit(0)\n' > /usr/local/bin/typst && chmod +x /usr/local/bin/typst

RUN mkdir -p /workspace/outputs

WORKDIR /workspace

CMD ["tail", "-f", "/dev/null"]