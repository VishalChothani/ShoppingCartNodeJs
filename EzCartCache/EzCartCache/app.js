var express = require('express')
  , modulus = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , ejs = require("ejs");

var flash = require('connect-flash');
var app = express();

app.use(express.cookieParser());
app.use(express.session({ secret:"vishalchothani21"}));


var mysql = require("./mysqlOperation");

// all environments
app.set('port', process.env.PORT || 3022);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res)
{	
	delete req.session.sessionName;
	res.render('HomePageLogin.ejs', { wrong_credential: ''});
});

app.get('/SignUp', function(req, res)
{
	res.render('SignUp.ejs',{title:""});
});

app.post('/UserProfile', function(req, res)
{
	mysql.SignUpUser(function(value,category,products,err,results){
		req.session.sessionName = value;
		if(err){
			throw err;
		}		
		else{
			if(value==0)
			{
				res.render('SignUp.ejs', { title: 'Username is already taken'});
			}
			else
			{
				ejs.renderFile('./views/UserHomePage.ejs', { username: req.session.sessionName, category_info: category, products_info:products, selectedCategory:'All', last_login: 'You have login for the 1st time'}, 
				function(err, result) {
				// render on success
				if (!err) {
					res.end(result);
				}
				// render or error
				else {
					res.end('An error occurred');
					console.log(err);
				}
			});
		}
		}
	},req.param('firstname'),req.param('lastname'),req.param('username'),req.param('password'),req.param('address'),req.param('email'));
});

app.post('/UserHomePage', function(req, res)
{
	console.log(req.param('username'),req.param('password'));
	mysql.LogInUser(function(value,category,products,user_last_login,err,results)
	{		
		req.session.sessionName = value;
		req.session.user_last_login = user_last_login;
		if(err){
			throw err;
		}		
		else{
			if(value==0)
			{				
					res.render('HomePageLogin.ejs', { wrong_credential: 'Wrong Credential'});				
			}
			else
			{				
				if(req.param('username')=="admin" && req.param('password')=="admin123" )
				{
					req.session.sessionName = "admin";
					console.log(products);
					res.render('AdminPage.ejs', { username: req.session.sessionName, category_info: category, products_info:products});
				}
				else
				{
				ejs.renderFile('./views/UserHomePage.ejs', { username: req.session.sessionName, category_info: category, products_info:products, selectedCategory:'All', last_login:user_last_login}, 
					function(err, result) {
				// render on success
				if (!err) {
					res.end(result);
				}
				// render or error
				else {
					res.end('An error occurred');
					console.log(err);
				}
			});
				}
		}
		}
	},req.param('username'),req.param('password'));
});


app.post('/UserProfile', function(req, res)
{
	mysql.SignUpUser(function(value,category,products,err,results){
		req.session.sessionName = value;
		if(err){
			throw err;
		}		
		else{
			if(value==0)
			{
				res.render('SignUp.ejs', { title: 'Username is already taken'});
			}
			else
			{
				ejs.renderFile('./views/UserHomePage.ejs', { username: req.session.sessionName, category_info: category, products_info:products, selectedCategory:'All', last_login: 'You have login for the 1st time'}, 
				function(err, result) {
				// render on success
				if (!err) {
					res.end(result);
				}
				// render or error
				else {
					res.end('An error occurred');
					console.log(err);
				}
			});
		}
		}
	},req.param('firstname'),req.param('lastname'),req.param('username'),req.param('password'),req.param('address'),req.param('email'));
});

app.get('/UserHomePage', function(req, res)
{
	mysql.getHomePage(function(category,products,err,results)
	{
		if(err){
			throw err;
		}		
		else
		{
			ejs.renderFile('./views/UserHomePage.ejs', { username: req.session.sessionName, category_info: category, products_info:products, selectedCategory:'All', last_login:req.session.user_last_login}, 
			function(err, result) 
			{
				// render on success
				if (!err) 
				{
					res.end(result);
				}
				// render or error
				else 
				{
					res.end('An error occurred');
					console.log(err);
				}
			});
		}
	});
});

app.get('/Category/:CategoryName', function(req, res)
{
	
	mysql.gettingParticularProduct(function(value,category,products,err,results)
	{
		//req.session.sessionName = value;
		if(err){
			throw err;
		}		
		else{
			if(value==0)
			{
				ejs.renderFile('./views/UserHomePage.ejs', { username: req.session.sessionName, category_info: category, products_info:products, selectedCategory:req.params.CategoryName, last_login:""});
			}
			else
			{
				ejs.renderFile('./views/UserHomePage.ejs', { username: req.session.sessionName, category_info: category, products_info:products, selectedCategory:req.params.CategoryName, last_login:""}, 
				function(err, result) {
				// render on success
				if (!err) {
					res.end(result);
				}
				// render or error
				else {
					res.end('An error occurred');
					console.log(err);
				}
			});
		}
		}
	},req.param('CategoryName'));
});

app.get('/UserHomePage/:DeleteProductName/:ProductCountForUpdate',function(req,res){
	mysql.deletingParticularProduct(function(category,products,err,results)
	{
		if(err)
		{
			throw err;
		}		
		else
		{
				ejs.renderFile('./views/UserHomePage.ejs', { username: req.session.sessionName, category_info: category, products_info:products, selectedCategory:req.params.CategoryName, last_login: req.session.user_last_login}, 
				function(err, result) 
				{
					// render on success
					if (!err) {
						res.end(result);
					}
					// render or error
					else {
						res.end('An error occurred');
						console.log(err);
					}
				});
			
		}
	},req.param('DeleteProductName'),req.param('ProductCountForUpdate'),req.session.sessionName);
});

app.post('/Ajax_AddToCart', function(req, res)
{		
	var insert_product = req.body.insert_product.replace('""','');
	var input_quantity = req.body.input_no_of_products.replace('""','');

	mysql.insertProductsIntoCart(function(err,result)
	{		
		console.log('insert');
		if(err){
			console.log('Error in aap,js');
			throw err;
		}		
		else{
			console.log('Back to app.js');
		}
	},req.session.sessionName,insert_product,input_quantity); 
	res.send(req.body);
});

/* ===================== ADMIN ============================== */

app.post('/Ajax_AddCategoryName', function(req, res)
{		
	var insert_category_name = req.body.insert_category_name.replace('""','');	

	mysql.insertCategoryNameIntoCategory(function(err,result)
	{		
		if(err){
			console.log('Error in aap,js');
			throw err;
		}		
		else{
			console.log('Successfully added to Category');
		}
	},insert_category_name); 
	res.send(req.body);
});

app.post('/Ajax_AddProduct', function(req, res)
{		
	var category_list = req.body.category_list.replace('""','');
	var insert_product_name = req.body.insert_product_name.replace('""','');
	var insert_product_price = req.body.insert_product_price.replace('""','');
	var insert_no_of_product = req.body.insert_no_of_product.replace('""','');
	var insert_product_desc = req.body.insert_product_desc.replace('""','');

	console.log("AJAX_ADDPROSDUCT");
	mysql.insertProductInfoIntoProducts(function(err,result)
	{		
		if(err){
			console.log('Error in aap,js');
			throw err;
		}		
		else{
			console.log('Successfully added to Category');
		}
	},category_list,insert_product_name,insert_product_price,insert_no_of_product,insert_product_desc); 
	res.send(req.body);
});

app.post('/Ajax_DisplayCart', function(req, res)
{		
	console.log("Ajax_DisplayCart");
	mysql.DisplayCart(function(userCart,err,result)
	{		
		//console.log("/n"+userCart[0].product_name);
		if(err){
			console.log('Error in aap.js');
			throw err;
		}		
		else{			
			console.log('Successfully displayed to Category');
			res.send(userCart);
		}
	},req.session.sessionName);
	//console.log(req.body);
	//res.send(req.body);
});

app.post("/CheckOut",function(req,res)
{
	mysql.DisplayCart(function(userCart,err,result)
	{		
		if(err)
		{
			console.log('Error in aap.js');
			throw err;
		}		
		else{
			console.log(userCart);
			console.log('Successfully displayed to Category');
			res.render('Checkout.ejs',{userCart:userCart});
		}
	},req.session.sessionName);
	
});

app.get("/history",function(req,res)
{
	mysql.DisplayHistory(function(userCart,err,result)
	{		
		if(err)
		{
			console.log('Error in aap.js');
			throw err;
		}		
		else{
			console.log(userCart);
			res.render('History.ejs',{userCart:userCart});
		}
	},req.session.sessionName);
	
});

app.post("/PaymentDone",function(req,res)
{
	mysql.Payment(function(err,result)
	{				
		if(err){
			console.log('Error in aap.js');
			throw err;
		}		
		else{			
			console.log('Payment Done Successfully ');
			res.render('successful.ejs');
		}
	},req.session.sessionName);
	//res.render('successful.ejs');
});




app.get('/users', user.list);

var i=0;
http.createServer(app).listen(app.get('port'), function()
{
	console.log('Express server listening on port ' + app.get('port'));
	mysql.CachingUser(); 
	mysql.CachingCart();
	mysql.CachingCategory();
	mysql.CachingProduct();

});


