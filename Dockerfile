FROM python:3.12-slim

WORKDIR /app

COPY app.py /app/app.py
COPY static /app/static

ENV PORT=10000

EXPOSE 10000

CMD ["python", "app.py"]
