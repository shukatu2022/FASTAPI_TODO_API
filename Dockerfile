# Python3.11公式イメージ
FROM python:3.11-slim

# Pythonの出力を即座に表示
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_VIRTUALENVS_CREATE=false

WORKDIR /src

# # requirements.txt をコピー
# COPY requirements.txt .

# # 依存ライブラリをインストール
# RUN pip install --no-cache-dir --upgrade pip \
#     && pip install --no-cache-dir -r requirements.txt

RUN pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root

# ソースコードをコピー
COPY . .

# FastAPI起動
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"]
