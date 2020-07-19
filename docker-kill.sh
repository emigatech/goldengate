# Remove all containers
docker ps -a | awk '{print $1}' | tail -n+2 | xargs docker rm -f
# Remove all images
docker images | awk '{print $3}' | tail -n+2 | xargs docker image rm -f