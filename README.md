# SITN Stationnements

## About

This app is used to compute the number of car parkings in construction projects.

## Getting started

Start a terminal (e.g. Windows PowerShell)

Install Vite globally using npm:
```
npm i vite -g
```
Set the working directory to the project directory (*sitn_stationnements*)

Build the app with:
```
vite build
```

Run the app locally (on localhost) with:
```
vite
```

## Docker deployment

To just build locally:
```
docker build -t sitn-stationnement . 
```

To build and run locally:
```
docker compose up -d --build 
```

To build and run on remote server:

Set the **DOCKER_HOST** environment variable and launch the build/run :
```
$env:DOCKER_HOST="<PATH_TO_REMOTE_HOST>"
docker compose up -d --build
```
