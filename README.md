# myapp
need local redis running at port 6379.

check redis by ```redis-cli ping```

run the app: ```npm start```

to get ig info, ```curl -X POST http://localhost:3000/users/{username}```

to pull the latest ig info, ```curl http://localhost:3000/users/{username}```
