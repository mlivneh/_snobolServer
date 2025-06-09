# SNOBOL4 Web Service - Dockerfile
# This dockerfile compiles SNOBOL4 from source and creates a web service wrapper

FROM node:20-bookworm

# Set working directory inside the container
WORKDIR /usr/src/app

# Update package manager and install all dependencies needed for SNOBOL4 compilation
RUN apt-get update && apt-get install -y build-essential m4 wget && \
    # Download, extract and compile SNOBOL4 from source
    wget https://ftp.regressive.org/snobol4/snobol4-2.3.3.tar.gz && \
    tar -xvf snobol4-2.3.3.tar.gz && \
    cd snobol4-2.3.3 && \
    ./configure && \
    make && \
    # Install SNOBOL4 binary to system path
    cp snobol4 /usr/local/bin/snobol4 && \
    # Clean up temporary files to reduce image size
    cd .. && rm -rf snobol4-2.3.3*

# Copy Node.js dependencies and install them
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Expose the port our server listens on
EXPOSE 3000

# Command to run when container starts
CMD ["node", "server.js"]