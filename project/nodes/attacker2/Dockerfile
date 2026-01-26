FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        hping3 \
        ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Make `python` available as `python`
RUN ln -s /usr/bin/python3 /usr/bin/python

ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install -r requirements.txt

WORKDIR /app

CMD ["uvicorn", "app.main:app", "--port", "8000", "--host", "0.0.0.0"]
