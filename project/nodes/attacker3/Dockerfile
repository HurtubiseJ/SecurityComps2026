FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# System deps for python sockets + build essentials kept minimal
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install shared node_monitor
COPY shared/node_monitor /opt/node_monitor
RUN pip install --no-cache-dir -e /opt/node_monitor

# Install app deps
COPY nodes/attacker3/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# App code and default config
COPY nodes/attacker3/app /app
COPY nodes/attacker3/MASTER_CONFIG.json /MASTER_CONFIG.json

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
