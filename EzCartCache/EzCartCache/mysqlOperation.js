var ejs = require("ejs");
exports.SignUpUser = SignUpUser;
exports.LogInUser = LogInUser;
exports.gettingParticularProduct = gettingParticularProduct;
exports.insertProductsIntoCart = insertProductsIntoCart;
exports.insertCategoryNameIntoCategory = insertCategoryNameIntoCategory;
exports.insertProductInfoIntoProducts = insertProductInfoIntoProducts;
exports.DisplayCart = DisplayCart;
exports.deletingParticularProduct = deletingParticularProduct;
exports.Payment = Payment;
exports.getHomePage = getHomePage;

/* ============ FOR CHACHING ================ */

exports.CachingUser = CachingUser; 
exports.CachingCart = CachingCart;
exports.CachingCategory = CachingCategory;
exports.CachingProduct = CachingProduct;

var LoginDetails = {};
var CartDetails = {};
var CategoryDetails = {};
var ProductsDetails = {};
var flag = 1;

var productCount = {};
var moment = require('moment');
var last_login = moment().format('MMMM Do YYYY, h:mm:ss a');

function CachingUser()
{
	var mysql = require('mysql');
	var connection = mysql.createConnection(
	{
		host     : 'localhost',
		user     : 'root',
		password : '1234',
		port: '3306',
		database: 'ezcart'
	});
 
	var sqlUsers = "select * from users";
	connection.query(sqlUsers, function(err, rowsUsers, fields)
	{
		LoginDetails = rowsUsers;
		console.log(LoginDetails);
	});
}

function CachingCart()
{
	var mysql = require('mysql');
	var connection = mysql.createConnection(
	{
		host     : 'localhost',
		user     : 'root',
		password : '1234',
		port: '3306',
		database: 'ezcart'
	});
	
	var sqlCart = "select * from cart";
	connection.query(sqlCart, function(err, rowsCart, fields)
	{
		CartDetails = rowsCart;		
		console.log(CartDetails);
	});
}

function CachingCategory()
{
	var mysql = require('mysql');
	var connection = mysql.createConnection(
	{
		host     : 'localhost',
		user     : 'root',
		password : '1234',
		port: '3306',
		database: 'ezcart'
	});
	
	var sqlCategory = "select * from category";
	connection.query(sqlCategory, function(err, rowsCategory, fields)
	{
		CategoryDetails = rowsCategory;
		console.log(CategoryDetails);
	}); 
}

function CachingProduct()
{
	var mysql = require('mysql');
	var connection = mysql.createConnection(
	{
		host     : 'localhost',
		user     : 'root',
		password : '1234',
		port: '3306',
		database: 'ezcart'
	});
	var sqlProducts = "select * from product";
	connection.query(sqlProducts, function(err, rowsProducts, fields)
	{
		ProductsDetails = rowsProducts;
		console.log(ProductsDetails);
	});
	
}

function SignUpUser(callback,firstname,lastname,username,password,address,email) 
{
	
	var mysql = require('mysql');
	var connection = mysql.createConnection(
	{
		host     : 'localhost',
		user     : 'root',
		password : '1234',
		port: '3306',
		database: 'ezcart'
	});
	
	for(var i in LoginDetails)
	{		
		if(LoginDetails[i].username==username)
		{
			flag = 0;
			break;			
		}
		else
		{
			flag = 1;
		}
	}
	if(flag==0)
	{
		callback(0);		// User already taken
	}
	else if(flag==1)
	{
		var sql = "INSERT INTO users(firstname,lastname,username,password,address,email,last_login) values('"+firstname+"','"+lastname+"','"+username+"','"+password+"','"+username+"','"+email+"','"+last_login+"')";

		connection.query(sql, function(err, res) 
		{});
		CachingUser();
		callback(username,CategoryDetails,ProductsDetails);
	}
}

function LogInUser(callback,username,password) 
{
	var updateLastLogin;
	var mysql = require('mysql');
	var connection = mysql.createConnection(
	{
		host     : 'localhost',
		user     : 'root',
		password : '1234',
		port: '3306',
		database: 'ezcart'
	});
	
	for(var i in LoginDetails)
	{		
		if(LoginDetails[i].username==username && LoginDetails[i].password==password)
		{
			flag = 0;
			updateLastLogin = LoginDetails[i].last_login;
			break;			
		}
		else
		{
			flag = 1;
		}
	}
	if(flag==1)
	{
		callback(0);		// Wrong credential
	}
	else if(flag==0)
	{
		var sql = "Update users set last_login='"+updateLastLogin+"' where username='"+username+"'";
		connection.query(sql, function(err, res) 
		{});
		
		CachingUser();
		callback(username,CategoryDetails,ProductsDetails,updateLastLogin);
		
	}
}

function getHomePage(callback) 
{
	callback(CategoryDetails,ProductsDetails);
}


function gettingParticularProduct(callback,CategoryName) 
{
	var ParticularProduct = {};
	var j=0;
	for(var i in ProductsDetails)
	{		
		if(ProductsDetails[i].category_name==CategoryName)
		{
			flag = 0;
			ParticularProduct[j] = ProductsDetails[i];
			j++;
		}
		else
		{
			flag = 1;
		}
	}	
	if(JSON.stringify(ParticularProduct)=="{}")
	{
		callback(1,CategoryDetails,"");
	}
	else
	{
		callback(1,CategoryDetails,ParticularProduct);
	}
}

/* ========================= Deleting Product from Cart ===============================  */

function deletingParticularProduct(callback,ProductName,ProductCount,username) 
{
	var NoOfProducts;
	var updateNoOfProducts;
	var mysql = require('mysql');
	var connection = mysql.createConnection(
	{
		host     : 'localhost',
		user     : 'root',
		password : '1234',
		port: '3306',
		database: 'ezcart'
	});
	
	var sql1 = "delete from cart where username='"+username+"' and product_name='"+ProductName+"'";
	connection.query(sql1, function(err, rows1, fields)
	{});
	CachingCart();

	for(var i in ProductsDetails)
	{		
		if(ProductsDetails[i].product_name==ProductName)
		{
			NoOfProducts = ProductsDetails[i].no_of_product;
		}
	}
	updateNoOfProducts = parseInt(NoOfProducts) - parseInt(ProductCount) ;
	var sqlUpdate = "Update product set no_of_product='"+updateNoOfProducts+"' where product_name='"+ProductName+"'";
	connection.query(sqlUpdate, function(err, rowsUpdate, fields)
	{});
	CachingProduct();
	
	callback(CategoryDetails,ProductsDetails);
}


function insertProductsIntoCart(callback,username,ProductName,input_quantity) 
{
	var updateProductPrize;
	var updateProductCount;
	var product_count;
	
	var mysql = require('mysql');
	var connection = mysql.createConnection(
	{
		host     : 'localhost',
		user     : 'root',
		password : '1234',
		port: '3306',
		database: 'ezcart'
	});
	
	for(var i in ProductsDetails)
	{		
		if(ProductsDetails[i].product_name==ProductName)
		{			
			updateProductPrize = ProductsDetails[i].product_prize;
			updateProductCount = ProductsDetails[i].no_of_product  - input_quantity;
			var sqlUpdate = "Update product set no_of_product='"+updateProductCount+"' where product_name='"+ProductName+"'";
			connection.query(sqlUpdate, function(err, rowsCheck, fields)
			{});
			CachingProduct();
			break;			
		}		
	}
	flag=1;
	for(var i in CartDetails)
	{		
		if(CartDetails[i].product_name==ProductName && CartDetails[i].username==username)
		{
			product_count = parseInt(CartDetails[i].product_count) + parseInt(input_quantity);
			var sqlUpdateCart = "Update cart set product_count='"+product_count+"' where username='"+username+"' and product_name='"+ProductName+"'";			
			connection.query(sqlUpdateCart, function(err, res) 
			{});
			flag=0;
			CachingCart();
			callback();
			break;
		}
		else
		{
			flag=1;
		}
	}
	if(flag==1)
	{
		var sql1 = "INSERT INTO cart(username,product_name,product_count,product_prize) values('"+username+"','"+ProductName+"','"+input_quantity+"','"+updateProductPrize+"')";
		connection.query(sql1, function(err, rowsProduct, fields)
		{});
		CachingCart();
		callback();
	}
}

function insertCategoryNameIntoCategory(callback,CategoryName) 
{	
	var mysql = require('mysql');
	var connection = mysql.createConnection(
	{
		host     : 'localhost',
		user     : 'root',
		password : '1234',
		port: '3306',
		database: 'ezcart'
	});
		
	var sqlInsertCategory = "INSERT INTO category(category_name) values('"+CategoryName+"')";
	connection.query(sqlInsertCategory, function(err, rows, fields)
	{
		if(err)
		{
			console.log("ERROR: " + err.message);
		}
		else
		{													
			console.log("Succesfully inserted in Database (Category)");
			callback();
		}						
	}); 				
}

function insertProductInfoIntoProducts(callback,CategoryName,ProductName,ProductPrize,NoOfProducts,ProductDesc) 
{	
	var mysql = require('mysql');
	var connection = mysql.createConnection(
	{
		host     : 'localhost',
		user     : 'root',
		password : '1234',
		port: '3306',
		database: 'ezcart'
	});
	
	var sqlInsertProduct = "INSERT INTO product(product_name,product_prize,no_of_product,product_desc,category_name) values('"+ProductName+"','"+ProductPrize+"','"+NoOfProducts+"','"+ProductDesc+"','"+CategoryName+"')";
	connection.query(sqlInsertProduct, function(err, rows, fields)
	{});
	CachingProduct();
	callback();
}

function DisplayCart(callback,username) 
{		
	CachingCart();
	var CartInfo = {};
	var j=0;
	for(var i in CartDetails)
	{		
		if(CartDetails[i].username==username)
		{
			CartInfo[j] = CartDetails[i];
			j++;
		}		
	}	
	callback(CartInfo);
}

function DisplayHistory(callback,username) 
{		
	var mysql = require('mysql');
	var connection = mysql.createConnection(
	{
		host     : 'localhost',
		user     : 'root',
		password : '1234',
		port: '3306',
		database: 'ezcart'
	});
	
	var sqlDisplayCart = "select * from history where username='"+username+"'";
	connection.query(sqlDisplayCart, function(err, rows, fields)
	{
		if(err)
		{
			console.log("ERROR: " + err.message);
		}
		else
		{													
			console.log("Succesfully");			
			callback(rows);
		}						
	});
	
}

function Payment(callback,username)
{		
	var mysql = require('mysql');
	var connection = mysql.createConnection(
	{
		host     : 'localhost',
		user     : 'root',
		password : '1234',
		port: '3306',
		database: 'ezcart'
	});
	
	for(var i in CartDetails)
	{		
		if(CartDetails[i].username==username)
		{
			var sqlInsertHistory = "INSERT INTO history(username,product_name,product_count,product_prize) values('"+CartDetails[i].username+"','"+CartDetails[i].product_name+"','"+CartDetails[i].product_count+"','"+CartDetails[i].product_prize+"')";
			connection.query(sqlInsertHistory, function(err, rowsHistory, fields)
			{});
			
			var sql1 = "delete from cart where username='"+username+"'";
			connection.query(sql1, function(err, rows1, fields)
			{});
			CachingCart();
		}		
	}
	callback(); 				
}