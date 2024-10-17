Configure the following lines in `.\public\routes\routes.js` to your local data warehouse before running `node index.js`

```
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "h01", 
  multipleStatements: true,
});
```

STADVDB - XX22
- Capunitan
- Santiago
- Villarica  
