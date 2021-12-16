# set node version
FROM node:16

# set working directory as root, since we want to run both client and server
WORKDIR .

# install redis
RUN wget https://download.redis.io/releases/redis-6.2.6.tar.gz
RUN tar xzf redis-6.2.6.tar.gz
WORKDIR ./redis-6.2.6
RUN make

WORKDIR ..

# RUN ./src/redis-cli PING

# install local dependencies
COPY package*.json ./
RUN npm install
# for client
# WORKDIR ./client
# COPY package*.json ./
# RUN npm install
# for server
# WORKDIR ../server
# COPY package*.json ./
# RUN npm install

# reset workdir
# WORKDIR ..

# bundle source code
COPY . .

# expose the port to connect to
EXPOSE 8080

# start the app
RUN npm start