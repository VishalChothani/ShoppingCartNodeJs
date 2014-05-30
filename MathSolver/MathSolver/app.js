
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var ejs = require("ejs");
var userInput = 0;

var url = require('url');

var app = express();

// For validation

var iz = require('iz'),
are = iz.are,
validators = iz.validators;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);	//answer differently to request
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req, res) {
	res.render('index.ejs', { title: 'Prime Number', userInputIs: '', userInputAll: '', result: ""});
});

app.post('/isPrimeNumber', function (req, res) {	
	var finalResult;
	var userInput = req.body.inputNumberIs;
	//console.log("For IS :- "+userInput);
	var numberValidation = iz.between(userInput,1,1000);
	var emptyValidation = iz.empty(userInput);
	//console.log(emptyValidation);
	//if()
	if(numberValidation===false || emptyValidation===true)
	{
		finalResult = "Please enter the Number between 1 to 1000";
	}
	else
	{
		var flagIsPrime=true;
		for(var iteration1 = 2; iteration1 <= userInput/2 ; iteration1++)
		{
			if(userInput % iteration1 === 0)
	        {
	            flagIsPrime = false;
	        }
	    }
		if(flagIsPrime === true)
		{
			finalResult = userInput+" is prime";
		}
		else
		{
			finalResult = userInput+" is not prime";
		}			
	}	
	//console.log(finalResult);
	res.render('index.ejs', { title: 'Prime Number' , userInputIs: userInput, userInputAll: '', result: finalResult });
});

app.post('/allPrimeNumber', function (req, res) {	
	var finalResult;
	var userInput = req.body.inputNumberAll;
	//console.log("For ALL :- "+userInput);
	var numberValidation = iz.between(userInput,1,1000);
	var emptyValidation = iz.empty(userInput);
	
	if(numberValidation===false || emptyValidation===true)
	{
		finalResult = "Please enter the Number between 1 to 1000";
	}
	else
	{
		finalResult = "\n\n";
		for (var iteration1 = 2; iteration1<userInput; iteration1++) 
		{
			var flagAllPrime = true;
			for (var iteration2 = 2; iteration2 < iteration1; iteration2++) 
			{
				if (iteration1 % iteration2 == 0) 
				{
					flagAllPrime = false;
					break;
				}
			}
			if (flagAllPrime) 
			{			
				finalResult = finalResult + iteration1 + " ";
			}
		}
		finalResult = finalResult + "\nThese are the prime numbers";					
	}	
	res.render('index.ejs', { title: 'Prime Number' , userInputAll: userInput,userInputIs: '', result: finalResult });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
