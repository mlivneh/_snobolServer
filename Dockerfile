# התחל מתמונת בסיס רשמית של Node.js, הכוללת מערכת הפעלה מלאה (דביאן)
FROM node:20-bookworm

# הגדר את ספריית העבודה בתוך הקונטיינר
WORKDIR /usr/src/app

# עדכן את מנהל החבילות והתקן את כל התלויות הדרושות לקומפילציה של סנובול
RUN apt-get update && apt-get install -y build-essential m4 wget

# הורד, חלץ וקמפל את SNOBOL4
RUN wget https://ftp.regressive.org/snobol4/snobol4-2.3.3.tar.gz && \
    tar -xvf snobol4-2.3.3.tar.gz && \
    cd snobol4-2.3.3 && \
    ./configure && \
    make && \
    cp snobol4 /usr/local/bin/snobol4

# העתק את קבצי התלות של Node.js והתקן אותם
COPY package*.json ./
RUN npm install

# העתק את שאר קבצי הפרויקט
COPY . .

# חשוף את הפורט שהשרת שלנו מאזין לו
EXPOSE 3000

# הפקודה שתרוץ כשהקונטיינר יופעל
CMD [ "node", "server.js" ]