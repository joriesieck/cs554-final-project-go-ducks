# set node version
FROM node:16

# set working directory as root, since we want to run both client and server
WORKDIR .

# install local dependencies
COPY package*.json ./
RUN npm install
# for client
WORKDIR ./client
RUN npm install
# for server
WORKDIR ../server
RUN npm install

# reset workdir
WORKDIR ..

# bundle source code
COPY . .

# expose the port to connect to
EXPOSE 8080

# start the app
RUN npm start