FROM harbor.online.njtech.edu.cn/library/node:alpine

# Create app directory
RUN mkdir -p /home/Service
WORKDIR /home/Service

# Bundle app source
COPY . /home/Service
RUN npm install

EXPOSE 7001
CMD [ "npm", "dev" ]