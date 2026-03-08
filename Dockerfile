# Python3.11公式イメージ
FROM python:3.11-slim

# Pythonの出力を即座に表示
ENV PYTHONUNBUFFERED=1

WORKDIR /src

# Poetryインストール
RUN pip install poetry

COPY pyproject.toml* poetry.lock* ./

RUN poetry config virtualenvs.create false
RUN poetry install

# pipで依存ライブラリをインストール --> requirements.txtを使用する場合 
# COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# ソースコードをコピー
COPY . .

# uvicornでFastAPIアプリを起動
ENTRYPOINT ["poetry", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
