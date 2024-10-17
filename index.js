
const express = require('express'); 
const app = express();
const routes = require('./routes/routes');
const path = require('path');

const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static("public"));
app.use('/', routes);

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, function() {        
    console.log(`Now listening on port ${port}`); 
});
