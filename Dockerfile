FROM ubuntu:24.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /cir-backend

# Update apt and install Python and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt /cir-backend/
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy the rest of the backend code
COPY . /cir-backend/

EXPOSE 8000
