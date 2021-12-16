# Go Ducks CS554 final project

To compose the Docker image with Docker Compose
- Make sure you have both Docker and Docker Compose installed: https://docs.docker.com/compose/install/
	- Docker for Windows/Mac comes with Compose
	- On Linux, install the Docker Engine https://docs.docker.com/engine/install/#server and then follow the above link for instructions installing Compose
- From the root of the project, run ```docker-compose up``` to build and run the container (and create the Docker image)
- To view the Docker image run ```docker images``` and it should be called ```cs554-final-project-go-ducks_node_app```