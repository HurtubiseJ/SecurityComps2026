# FastAPI app for proxy 
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV CONFIG_FILE_PATH="/MASTER_CONFIG.json"

WORKDIR /app

RUN pip install --upgrade pip setuptools wheel

COPY shared/node_monitor /opt/node_monitor
RUN pip install -e /opt/node_monitor

COPY nodes/proxy/app ./app
COPY nodes/proxy/requirements.txt .
COPY nodes/proxy/MASTER_CONFIG.json /

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
