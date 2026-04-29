FROM python:3.12-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY app.py /app/app.py
COPY static /app/static

ENV PORT=10000

EXPOSE 10000

CMD ["python", "app.py"]
