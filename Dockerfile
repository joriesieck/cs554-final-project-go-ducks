# set node version
FROM node:16

# set working directory as root, since we want to run both client and server
WORKDIR /home/jorie/f21-classes/cs554/cs554-final-project-go-ducks

# install local dependencies
COPY package*.json ./
RUN npm run install-dependencies

# bundle source code
COPY . .

# expose the port to connect to
EXPOSE 8080

# start the app
RUN npm start