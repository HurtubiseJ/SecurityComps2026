# Attacker 1 - Layer 7 HTTP Flood Attacker using wrk2
# Build context must be project root (../../) to access shared/ directory

FROM ubuntu:22.04

# Prevent interactive prompts and ensure clean Python output
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV LOCAL=True

# Install Python runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-venv \
        python3-pip \
        ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install build dependencies for compiling wrk2
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        git \
        make \
        gcc \
        zlib1g-dev \
        libssl-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Build wrk2 from ARM64-compatible fork (works on Apple Silicon)
RUN git clone --depth 1 https://github.com/AmpereTravis/wrk2-aarch64.git wrk2 && \
    cd wrk2 && \
    make && \
    cp wrk /usr/local/bin/ && \
    cd / && \
    rm -rf wrk2

# Remove build dependencies to reduce image size
RUN apt-get update && \
    apt-get purge -y build-essential git make gcc && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set up Python virtual environment
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"
RUN pip install --upgrade pip setuptools wheel

# Install shared node_monitor library for Prometheus metrics
COPY shared/node_monitor /opt/node_monitor
RUN pip install -e /opt/node_monitor

# Install application code and dependencies
COPY nodes/attacker1/app /app
COPY nodes/attacker1/requirements.txt /app/requirements.txt
COPY nodes/attacker1/MASTER_CONFIG.json /MASTER_CONFIG.json
RUN pip install -r /app/requirements.txt

WORKDIR /app

# Start FastAPI server on port 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
 