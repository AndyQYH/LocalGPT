ARG BASE_IMAGE_URL=ubuntu 
ARG BASE_IMAGE_TAG=2204

# -------------------------
# Stage 1: Final Image
# -------------------------
FROM ${BASE_IMAGE_URL}:${BASE_IMAGE_TAG}

ENV PYTHONDONTWRITEBYTECODE=1
ENV DEBIAN_FRONTEND noninteractive

ENV EXAMPLE_PATH=/app/backend
ENV PIP_NO_CACHE_DIR=1 

# Install required ubuntu packages for setting up python 3.10
RUN apt update && \
    apt install -y curl software-properties-common libgl1 libglib2.0-0 && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt update && apt install -y python3.10 && \
    apt-get clean

# Install pip for python3.10
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10

RUN rm -rf /var/lib/apt/lists/*

# Uninstall build packages
RUN apt autoremove -y curl software-properties-common

# Ensure python3 points to Python 3.10
# RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1

# Set environment variables needed for Text splitter
RUN mkdir /tmp-data/; mkdir /tmp-data/nltk_data/
RUN chmod 777 -R /tmp-data
RUN chown 1000:1000 -R /tmp-data
ENV NLTK_DATA=/tmp-data/nltk_data/
ENV HF_HOME=/tmp-data

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt
RUN pip3 install -r /app/chain_server/requirements.txt

# Copy the rest of your application code into the image
COPY . /app/backend

# Install nltk packages to avoid runtime download
RUN python3.10 -m nltk.downloader averaged_perceptron_tagger
RUN python3.10 -m nltk.downloader stopwords
RUN python3.10 -m nltk.downloader punkt
# RUN python3.10 -c "from sentence_transformers import SentenceTransformer; model = SentenceTransformer('Snowflake/snowflake-arctic-embed-l'); model.save('/tmp-data')"

RUN if [ -f "/app/${EXAMPLE_PATH}/requirements.txt" ] ; then \
    pip3 install -r /app/${EXAMPLE_PATH}/requirements.txt ; else \
    echo "Skipping example dependency installation, since requirements.txt was not found" ; \
    fi

RUN apt update && \
    apt install -y libreoffice tesseract-ocr ; 
    
WORKDIR /app
ENTRYPOINT ["uvicorn", "backend.chain_server.server:app", "--host", "0.0.0.0", "--port", "8000"]
