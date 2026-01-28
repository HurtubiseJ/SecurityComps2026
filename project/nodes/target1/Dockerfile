FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-venv \
        python3-pip \
        hping3 \
        ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN python3 -m venv venv
ENV PATH="/venv/bin:$PATH"

RUN pip install --upgrade pip setuptools wheel

COPY shared/node_monitor /opt/node_monitor
RUN pip install -e /opt/node_monitor

COPY nodes/target1/app /app


COPY nodes/target1/requirements.txt /app/requirements.txt
COPY nodes/target1/MASTER_CONFIG.json .
RUN pip install --no-cache-dir -r /app/requirements.txt

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]