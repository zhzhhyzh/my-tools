FROM python:3.11-slim

# Install system dependencies for PDF processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-eng \
    wget \
    fontconfig \
    libxrender1 \
    libxext6 \
    libjpeg62-turbo \
    xfonts-75dpi \
    xfonts-base \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    && rm -rf /var/lib/apt/lists/*

# Install wkhtmltopdf manually (not in Debian Trixie repos)
RUN wget -q https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-3/wkhtmltox_0.12.6.1-3.bookworm_amd64.deb -O /tmp/wkhtmltox.deb \
    && dpkg -i /tmp/wkhtmltox.deb || true \
    && apt-get update && apt-get install -f -y --no-install-recommends \
    && rm /tmp/wkhtmltox.deb && rm -rf /var/lib/apt/lists/*

# HF Spaces requires non-root user with UID 1000
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY --chown=user . /app

# Render sets PORT env var; fallback to 10000 (Render default)
EXPOSE 10000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}"]
