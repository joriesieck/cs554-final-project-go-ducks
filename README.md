# Go Ducks CS554 final project

## Environment set up

- Make sure you have the `.env` file in the root of the server folder.
- Make sure you have the `next.config.js` file in the root of the client folder.
- To install and run client and server together, run: - `npm install` in the root of the project, followed by - `npm build` in the client folder, followed by - `npm start` in the root of the project.
  This will install all the modules for both client and server, build the client, and start everything concurrently.

## To view on Heroku

**http://cs554-client.herokuapp.com**

## To build and run the Docker image with Docker Compose

- Make sure you have both Docker and Docker Compose installed: https://docs.docker.com/compose/install/
  - Docker for Windows/Mac comes with Compose
  - On Linux, install the Docker Engine https://docs.docker.com/engine/install/#server and then follow the above link for instructions installing Compose
- From the root of the project, run `docker-compose up` to build and run the container (and create the Docker image)
- To view the Docker image run `docker images` and it should be called `cs554-final-project-go-ducks_node_app`

## The database

- We are using the cloud based Mongo Atlas database that is preseeded, so there is no need to seed the database
