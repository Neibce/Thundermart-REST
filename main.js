const express = require('express');
const app = express();
const logger = require('morgan');

app.disable('x-powered-by');

app.use(express.json());
app.use(logger('short'));

const usersRouter = require('./routes/users')(app);
app.use('/users', usersRouter);
const itemsRouter = require('./routes/items')(app);
app.use('/items', itemsRouter);


app.get('*', function(req, res){
  res.status(404).json({ result: 404 });
});

const server = app.listen(80, function(){
	console.log("Express server has started on port 80");
});