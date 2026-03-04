# Python3.11公式イメージ
FROM python:3.11-slim

# Pythonの出力を即座に表示
ENV PYTHONUNBUFFERED=1

WORKDIR /src

# pipで依存ライブラリをインストール
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# ソースコードをコピー
COPY . .

# uvicornでFastAPIアプリを起動
ENTRYPOINT ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
