# GoldenGate
For more documentation please visit [GoldenGate ApiDocs](https://linkedit.ml)
## environment files on production
- .env
- docker-compose.yaml
- Dockerfile
- process.yml

add google storage config json to ./config/google-cloud as ```google-storage.json```
add firebase config json to ./config/google-cloud as ```firebase.json```

## GoldenGate Api
- ```POST``` /api/auth/login (Rate Limit for 3rd request)
  - ```email:string``` 
  - ```password:string```
- ```POST``` /api/auth/register (Rate Limit for 3rd request)
  - ```email:string```
  - ```password:string```
  - ```firstname:string```
  - ```lastname:string```
- ```POST``` /api/fetch/(desktop|mobile)
  - ```Authorization: Bearer (token)``` 
  - ```url:string```
- ```POST``` /api/storage/migrate
  - ```Authorization: Bearer *```
  - ```key:string```
- ```POST``` /api/scrape 
  - ```Authorization: Bearer *```
  - ```cache:string``` (optional)
  - ```url:string```
  - ```key:string``` (optional)
- ```POST``` /api/worker/start 
  - ```url:string```
  - ```token:string``` 
  - ```device:string```
    - default ```desktop```, ```mobile```
- ```GET``` /api/data/results:key (Cache)
  - ```Authorization: Bearer *```
  - ```key:string```
