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
exports.DisplayHistory = DisplayHistory;

var productCount = {};
var moment = require('moment');
var last_login = moment().format('MMMM Do YYYY, h:mm:ss a');
var mysql = require('mysql');

var availableConnections = [];
var sizeofarray;

function establishConnection(){
	for (var i = 0 ;i< 10; i++)
	{
		var con = mysql.createConnection({
			host     : 'localhost',
			user     : 'root',
			password : '1234',
			port: '3306',
			database: 'ezcart'
		});
		availableConnections.push(con);
	}
	sizeofarray = 10;
}

function removeConnection(){
	for(var i =0;availableConnections.length/2;i++){
		var con = availableConnections.pop();
		con = null;
	}
}

function getConnectionFrom Pool(){
	var con = availableConnections.pop();
	return con;
}

function returnConnection(con){
	availableConnections.push(con);
}


exports.returnConnection = returnConnection;
exports.getConnectionFrom Pool = getConnectionFrom Pool;
exports.removeConnection = removeConnection;
exports.establishConnection = establishConnection;


///////////////////////////


function SignUpUser(callback,firstname,lastname,username,password,address,email) 
{
	var connection=getConnectionFrom Pool();
 
	var sql1 = "select username from users where username='"+username+"'";
	connection.query(sql1, function(err, rows, fields)
	{
		if(rows.length==0)
		{
			var sql = "INSERT INTO users(firstname,lastname,username,password,address,email,last_login) values('"+firstname+"','"+lastname+"','"+username+"','"+password+"','"+username+"','"+email+"','"+last_login+"')";

			connection.query(sql, function(err, res) 
			{
				if(err)
				{
					console.log("ERROR: " + err.message);
				}
				else
				{
					//console.log("SQL DB CONNECTED AND Values inserted");
					var sqlGetCategory = "select * from category";

					connection.query(sqlGetCategory, function(err, rows,fields) 
					{
						//console.log(rows);
						if(err)
						{
							console.log("ERROR: " + err.message);
						}
						else
						{
							//console.log("Got all the values");
							
							var sqlGetProducts = "select * from product";

							connection.query(sqlGetProducts, function(err, rowsProducts,fields) 
							{
								pro = rowsProducts;
								//console.log(rowsProducts);
								if(err)
								{
									console.log("ERROR: " + err.message);
								}
								else
								{
									//console.log("Got all the values");
								}
							
								callback(username,rows,rowsProducts);
							});
						}
					
						
					});
				}
			
				
			});
		
		}
		else
		{
			console.log("Username is already taken");
			callback(0,0);
		}
		
	});
	returnConnection(connection);
}

function LogInUser(callback,username,password) 
{	
	var connection=getConnectionFrom Pool(this);
	
	var sql1 = "select username,last_login from users where username='"+username+"' and password='"+password+"'";
	connection.query(sql1, function(err, rows, fields)
	{
		if(rows.length==0)
		{
			if(username=="admin" && password=="admin123")
			{
				rows.length = 1;
			}
		}
		if(rows.length!=0)
		{
			
			var user_last_login = rows[0].last_login;
			var sql = "Update users set last_login='"+last_login+"' where username='"+username+"'";

			connection.query(sql, function(err, res) 
			{
				if(err)
				{
					console.log("ERROR: " + err.message);
				}
				else
				{
					console.log("SQL DB CONNECTED AND Values Updated");
					var sqlGetCategory = "select * from category";

					connection.query(sqlGetCategory, function(err, rows,fields) 
					{
						//console.log(rows);
						if(err)
						{
							console.log("ERROR: " + err.message);
						}
						else
						{
							//console.log("Got all the values");
							
							var sqlGetProducts = "select * from product";

							connection.query(sqlGetProducts, function(err, rowsProducts,fields) 
							{
								if(err)
								{
									console.log("ERROR: " + err.message);
								}
								else
								{
									console.log("Got all the values");
								}
								//connection.end();
								callback(username,rows,rowsProducts,user_last_login);
							});
						}
					
						
					});
				}
			
				
			});
		
		}
		else
		{
			console.log("Wrong Credentials");
			callback(0,0);
		}
		
	});
	returnConnection(connection);
}

function getHomePage(callback) 
{
	var connection=getConnectionFrom Pool(this);
	var sqlGetCategory = "select * from category";

	connection.query(sqlGetCategory, function(err, rows,fields) 
	{
		if(err)
		{
			console.log("ERROR: " + err.message);
		}
		else
		{
			var sqlGetProducts = "select * from product";

			connection.query(sqlGetProducts, function(err, rowsProducts,fields) 
			{
				console.log(rowsProducts);
				if(err)
				{
					console.log("ERROR: " + err.message);
				}
				else
				{
					console.log("Got all the values");
				}
			
				callback(rows,rowsProducts);
			});
		}
	});
	returnConnection(connection);
}


function gettingParticularProduct(callback,CategoryName) 
{
	var connection=getConnectionFrom Pool(this);
	
	var sql1 = "select * from product where category_name='"+CategoryName+"'";
	connection.query(sql1, function(err, rowsProduct, fields)
	{
		console.log(rowsProduct);
		if(err)
		{
			console.log("ERROR: " + err.message);
		}
		else
		{
			var sqlGetCategory = "select * from category";

			connection.query(sqlGetCategory, function(err, rows,fields) 
			{
				console.log(rows);
				console.log(rowsProduct);
				if(err)
				{
					console.log("ERROR: " + err.message);
					callback(0);
				}
				else
				{
					callback(1,rows,rowsProduct);
				}
			});
		}
	}); 
				
	returnConnection(connection);
}

/* ========================= Deleting Product from Cart ===============================  */

function deletingParticularProduct(callback,ProductName,ProductCount,username) 
{
	var connection=getConnectionFrom Pool(this);
	
	var sql1 = "delete from cart where username='"+username+"' and product_name='"+ProductName+"'";
	connection.query(sql1, function(err, rows1, fields)
	{
		if(err)
		{
			console.log("ERROR: " + err.message);
		}
		else
		{
			console.log("Deleted Succesfully");
			var sqlGetCategory = "select * from category";

			connection.query(sqlGetCategory, function(err, rows,fields) 
			{
				console.log(rows);
				
				if(err)
				{
					console.log("ERROR: " + err.message);					
				}
				else
				{
					var sqlGetProducts = "select * from product";

					connection.query(sqlGetProducts, function(err, rowsProducts,fields) 
					{
						//console.log(rowsProducts);
						var sqlSelectNoOfProduct = "select no_of_product from product where product_name='"+ProductName+"'";
						connection.query(sqlSelectNoOfProduct, function(err, rowsNoOfProduct, fields)
						{
							if(err)
							{
								console.log("ERROR: " + err.message);
							}
							else
							{
								console.log(rowsNoOfProduct[0].no_of_product);
								var New_no_of_product = parseInt(rowsNoOfProduct[0].no_of_product) + parseInt(ProductCount);
								console.log(New_no_of_product);
								
								var sqlUpdate = "Update product set no_of_product='"+New_no_of_product+"' where product_name='"+ProductName+"'";
								connection.query(sqlUpdate, function(err, rowsUpdate, fields)
								{
									if(err)
									{
										console.log("ERROR: " + err.message);
									}
									else
									{
										callback(rows,rowsProducts);
									}
								});	
							}
						});
						
					});
				}
			});
		}
	}); 
	returnConnection(connection);
}


function insertProductsIntoCart(callback,username,ProductName,input_quantity) 
{
	var flag = 1;
	var connection=getConnectionFrom Pool(this);
	
	var sqlSelect = "select product_prize,no_of_product from product where product_name='"+ProductName+"'";
	connection.query(sqlSelect, function(err, rows, fields)
	{
		if(err)
		{
			console.log("ERROR: " + err.message);
		}
		else
		{			
			var product_prize = rows[0].product_prize;
			var New_no_of_product = rows[0].no_of_product - input_quantity;
			var product_count;
			
			var sqlUpdate = "Update product set no_of_product='"+New_no_of_product+"' where product_name='"+ProductName+"'";
			connection.query(sqlUpdate, function(err, rowsCheck, fields)
			{
				if(err)
				{
					console.log("ERROR: " + err.message);
				}
				else
				{
			
					var sqlCheck = "select username,product_name,product_count from cart where product_name='"+ProductName+"'";
					connection.query(sqlCheck, function(err, rowsCheck, fields)
					{
						if(err)
						{
							console.log("ERROR: " + err.message);
						}
						else
						{
							var a = rowsCheck.length;
							for(var i=0;i<rowsCheck.length;i++)
							{
								if(rowsCheck[i].username == username && rowsCheck[i].product_name == ProductName)
								{
									product_count = parseInt(rowsCheck[i].product_count) + parseInt(input_quantity);
									var sqlUpdateCart = "Update cart set product_count='"+product_count+"' where username='"+username+"' and product_name='"+ProductName+"'";
		
									connection.query(sqlUpdateCart, function(err, res) 
									{
										if(err)
										{
											console.log("ERROR: " + err.message);
										}
										else
										{
											console.log('Succesfully Updated');
											callback();
										}
									});
									flag = 0;
									break;
								}
								else
								{
									flag = 1;
								}
								//console.log(rowsCheck[i].product_count);
							}
							if(flag == 1)
							{
								var sql1 = "INSERT INTO cart(username,product_name,product_count,product_prize) values('"+username+"','"+ProductName+"','"+input_quantity+"','"+product_prize+"')";
								connection.query(sql1, function(err, rowsProduct, fields)
								{
									if(err)
									{
										console.log("ERROR: " + err.message);
									}
									else
									{
										console.log("Succesfully inserted in Database");
										callback();
									}
								});
							}
							
						}
					});
				}
			});
		}
	}); 				
	returnConnection(connection);
}

function insertCategoryNameIntoCategory(callback,CategoryName) 
{	
	var connection=getConnectionFrom Pool(this);
		
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
	returnConnection(connection);
}

function insertProductInfoIntoProducts(callback,CategoryName,ProductName,ProductPrize,NoOfProducts,ProductDesc) 
{	
	var connection=getConnectionFrom Pool(this);
	
	var sqlInsertProduct = "INSERT INTO product(product_name,product_prize,no_of_product,product_desc,category_name) values('"+ProductName+"','"+ProductPrize+"','"+NoOfProducts+"','"+ProductDesc+"','"+CategoryName+"')";
	connection.query(sqlInsertProduct, function(err, rows, fields)
	{
		if(err)
		{
			console.log("ERROR: " + err.message);
		}
		else
		{													
			console.log("Succesfully inserted in Database (Product)");
			callback();
		}						
	}); 				
	returnConnection(connection);
}

function DisplayCart(callback,username) 
{		
	var connection=getConnectionFrom Pool(this);
	
	var sqlDisplayCart = "select * from cart where username='"+username+"'";
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
	returnConnection(connection);
}

function DisplayHistory(callback,username) 
{		
	var connection=getConnectionFrom Pool(this);
	
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
	returnConnection(connection);
}

function Payment(callback,username)
{		
	var connection=getConnectionFrom Pool(this);
	
	var sqlDisplayCart = "select * from cart where username='"+username+"'";
	connection.query(sqlDisplayCart, function(err, rows, fields)
	{
		if(err)
		{
			console.log("ERROR: " + err.message);
		}
		else
		{
			for(var i in rows)
			{			
				//productCount[i] = rows[i].product_count;
				var sqlInsertHistory = "INSERT INTO history(username,product_name,product_count,product_prize) values('"+rows[i].username+"','"+rows[i].product_name+"','"+rows[i].product_count+"','"+rows[i].product_prize+"')";
				connection.query(sqlInsertHistory, function(err, rowsHistory, fields)
				{
					if(err)
					{
						console.log("ERROR: " + err.message);
					}
					else
					{
						var sql1 = "delete from cart where username='"+username+"'";
						connection.query(sql1, function(err, rows1, fields)
						{
							callback();
						});
												
					}
				});
			}
		}
	}); 				
	returnConnection(connection);
}