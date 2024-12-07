# Vip pro Wallet
Blockchain101

## 1. Prepare socket environment
```
cd PeerNetwork
npm install
npm run start
```

## 2. Run server app
```
cd server
npm install
npm run start:dev1 // using port 8080
npm run start:dev2 // using port 8085
```

## 3. Run client
```
cd client
npm install
npm run start // connect to 8080
or
npm run start:dev1 // run port 3000 and connect to server 8080
npm run start:dev2 // run port 3005 and connect to server 8085

### Reference
- https://github.com/lhartikk/naivecoin
