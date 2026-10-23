FROM node:20-alpine

# Gərəkli paketləri quraşdırırıq (Python, ffmpeg və yt-dlp)
RUN apk add --no-cache \
    python3 \
    ffmpeg \
    curl

# yt-dlp alətini endirib icazə veririk
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
