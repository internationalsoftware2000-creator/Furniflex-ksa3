

const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
require('dotenv').config();


const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5144;
// import express
// import cors
// create app
// create port


app.use(cors({
	origin : ['http://localhost:5173' , 'https://bikroyelectronics.web.app/'],
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());


// use cors for middleware without using you can't access server
// The express.json() middleware is used to parse incoming JSON requests



app.get("/", (req, res) => {
	res.send("simple crud is running");
});



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://mustafiz8260:BX58G1x7A189eFOO@bikroyelectroniscluster.9ujswdc.mongodb.net/?retryWrites=true&w=majority&appName=BikroyElectronisCluster";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	}
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		// await client.connect();
		// Send a ping to confirm a successful connection
		// await client.db("admin").command({ ping: 1 });
		console.log("Pinged your deployment. You successfully connected to MongoDB!");


		const database = client.db("UsersDB");
		const usersCollection = database.collection("users");
		const categoryCollection = database.collection("categoryCollection");
		const productsCollection = database.collection("productsCollection");
		const wishListCollection = database.collection("wishListCollection");
		const cartCollection = database.collection("cartCollection");
		const ordersCollection = database.collection("ordersCollection");
		const FlashSaleCollection = database.collection("FlashSaleCollection")
		const couponCollection = database.collection("couponCollection")




		// Json Web Token

		console.log(process.env.SECRET_KEY ,"ulla")

		app.post("/jwt" , async (req,res ) => {

			
			const result = req.body
			console.log(result , "result fo jwt");
			const token = jwt.sign(result , process.env.SECRET_KEY , {expiresIn: "1h"})

			res
			.cookie('token' , token , {
			  httpOnly : true,
			  secure: false,
			sameSite: 'lax'
	  
	  
			} )
			.send({success : true})
	  
			// res.send(token)
		  })


		//   jwt middleware

		const varifyToken = (req , res , next) => {
			const token = req.cookies.token
		
		
			// receive the token from cookie which is sent from clint
		
		
			console.log("value of token in middleware" , token);
			if(!token){
		
		
			  return res.status(401).send({message : "not authorosized"})
			}
			//if the user has no token user will get not authorized message
		 
		   
			jwt.verify(token , process.env.SECRET_KEY , (err , decoded) => {
			  if(err){
				console.log(err);
				return res.status(401).send({message : "error authorized"})
			  }
			  // if user have token but some error happened user will also not get the data
		
		
			  console.log("value in the token" , decoded);
			  req.user = decoded
			  next()
			})
		  }
		
		
		


	  
		// user Api

		app.get("/users", varifyToken ,async (req, res) => {

			const { customer } = req.query
			

			let query = {}
			if (customer) {
				query = { customer: true }
			}
			console.log(customer)
			const cursor = usersCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});


		app.get("/user/:email", async (req, res) => {
			const email = req.params.email;
			console.log(email);
			if (email) {
				const query = {email: (email) };
				const result = await usersCollection.findOne(query);
				res.send(result);
			}
		});


		app.post("/users", async (req, res) => {

			const user = req.body;

			const existingUser = await usersCollection.findOne({ email: user?.email });

			if (existingUser) {
				return res.status(400).send({ message: "User already exists" });
			}

			const result = await usersCollection.insertOne(user);
			res.send(result);
		});


		app.put("/users/update", async (req, res) => {
			const updateUser = req.body;

			const email = updateUser.email
			// const email = req.params.email;
			const query = { email: email };

			console.log(email, updateUser);
			const result = await usersCollection.updateOne(query, {
				$set: updateUser,
			});
			res.send(result);
			// console.log(id, updateUser);
		});

		app.put("/users/role", async (req, res) => {
			const email = req.body.email;

			// const email = updateUser.email
			// const email = req.params.email;
			const query = { email: email };

			console.log(email);
			const result = await usersCollection.updateOne(query, {
				$set: {
					role: "admin"
				},
			});
			res.send(result);
			// console.log(id, updateUser);
		});



		// Category collections



		app.get("/categories", async (req, res) => {
			const cursor = categoryCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		app.post("/categories",varifyToken , async (req, res) => {
			const categories = req.body;
			const result = await categoryCollection.insertOne(categories);
			res.send(result);
		});

		//  Product  collections

		app.post("/products", async (req, res) => {
			const product = req.body;
			const result = await productsCollection.insertOne(product);
			res.send(result);
		});
		// app.get("/products", async (req, res) => {
		// 	const cursor = productsCollection.find();
		// 	const result = await cursor.toArray();
		// 	res.send(result);
		// });

		app.get("/products", async (req, res) => {
			const {
				limit,
				sortBy,
				sortOrder,
				categories,
				minPrice,
				maxPrice,
				searchText,
				page,
			} = req.query;

			// Build the query object for MongoDB
			const query = {};
			const searchRegex = searchText ? new RegExp(searchText, "i") : null;

			// Add filters based on query parameters
			if (categories) {
				const categoryArray = categories.split(",");
				query.category = { $in: categoryArray };
			}
			if (minPrice && maxPrice) {
				query.price = {
					$gte: parseInt(minPrice),
					$lte: parseInt(maxPrice),
				};
			} else if (minPrice) {
				query.price = { $gte: parseInt(minPrice) };
			} else if (maxPrice) {
				query.price = { $lte: parseInt(maxPrice) };
			}
			if (searchText) {
				query.$or = [
					{ title: searchRegex },
					{ description: searchRegex },
					{ price: parseInt(searchText) || 0 },
					{ category: searchRegex },
				];
			}

			// Sort based on sortBy and sortOrder if provided
			let sortOptions = {};
			if (sortBy) {
				sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
			}

			const limitInt = parseInt(limit) || 30; // Default size is 10
			const pageInt = parseInt(page) || 0; // Default page is 0 (first page)

			// Execute query with optional limit and sorting
			let cursor = productsCollection.find(query);
			if (sortBy) {
				cursor = cursor.sort(sortOptions);
			}
			cursor = cursor.skip(pageInt * limitInt).limit(limitInt);

			const result = await cursor.toArray();
			res.json(result);
		});

		app.get("/productCount", async (req, res) => {
			const count = await productsCollection.estimatedDocumentCount();
			res.send({ count });
		});

		app.get("/products/:id", async (req, res) => {
			const id = req.params.id;
			console.log(id);
			if (id) {
				const query = { _id: new ObjectId(id) };
				const result = await productsCollection.findOne(query);
				res.send(result);
			}
		});

		app.put("/products/update/:id", varifyToken ,async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			const updateProduct = req.body.data;
			console.log(id, updateProduct);
			const result = await productsCollection.updateOne(query, {
				$set: updateProduct,
			});
			res.send(result);

			console.log(id, updateProduct);
		});

		//   Wishlist 

		app.post("/wishlist",varifyToken , async (req, res) => {
			const wishListProduct = req.body;


			console.log('Received wishlist product:', wishListProduct);

			const query = {
				productId: wishListProduct.productId,
				email: wishListProduct.email
			};

			console.log('Query:', query);

			const checkProduct = await wishListCollection.findOne(query);
			console.log("checkpoint", checkProduct);

			if (!checkProduct) {
				const result = await wishListCollection.insertOne(
					wishListProduct
				);
				res.send(result);
			} else {
				res.status(409).send({
					message: "Product already exists in the wishlist",
				});
			}
		});

		app.get("/wishlist", varifyToken ,async (req, res) => {
			const email = req.query.email;
			const query = { email: email };

			const cursor = wishListCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});

		app.get("/wishlistStatus",varifyToken , async (req, res) => {
			const email = req.query.email;
			const id = req.query.id;

			console.log(email, id)

			if (id && email) {
				const query = {
					email: email,
					productId: id
				};

				try {
					const cursor = await wishListCollection.find(query).toArray();

					if (cursor.length > 0) {
						res.send({ wishListed: true });
					} else {
						res.send({ wishListed: false });
					}
				} catch (error) {
					console.error("Error checking wishlist status:", error);
					res.status(500).send({ message: "Internal server error" });
				}
			}
		});


		app.delete("/wishlist/:id", varifyToken ,async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			console.log(id)

			const result = wishListCollection.deleteOne(query);

			res.send(result);
		});

		// cart 


		app.post("/cart" ,varifyToken , async (req, res) => {
			const cartProduct = req.body;


			console.log('Received cart product:', cartProduct);

			const query = {
				productId: cartProduct.productId,
				email: cartProduct.email
			};

			console.log('Query:', query);

			const checkProduct = await cartCollection.findOne(query);
			console.log("checkpoint", checkProduct);

			if (!checkProduct) {
				const result = await cartCollection.insertOne(
					cartProduct
				);
				res.send(result);
			} else {
				res.status(409).send({
					message: "Product already exists in the cart",
				});
			}
		});

		app.get("/cart", varifyToken , async (req, res) => {
			const email = req.query.email;
			const query = { email: email };
			

			const token = req.cookies.token;
			console.log("token is ", token);
	  

			const cursor = cartCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});

		app.put("/cart/:id", varifyToken ,async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			const updateProduct = req.body.quantity;
			console.log(id, updateProduct);
			const result = await cartCollection.updateOne(query, {
				$set: {
					quantity: updateProduct
				},
			});
			res.send(result);

			console.log(id, updateProduct);
			console.log(result);
		});
		app.delete("/cart/:id",varifyToken , async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			console.log(id)

			const result = cartCollection.deleteOne(query);

			res.send(result);
		});

		app.delete("/allCartItem", varifyToken ,async (req, res) => {

			const result = await cartCollection.deleteMany({});
			res.send(result);
		});

		app.post("/moveToCart",varifyToken , async (req, res) => {
			const cartProducts = req.body;

			const productIds = cartProducts.map(product => product._id);

			// Find the existing products in the cart
			const existingProducts = await cartCollection.find({ _id: { $in: productIds } }).toArray();
			const existingProductIds = existingProducts.map(product => product._id);

			// Filter out the products that are already in the cart
			const productsToInsert = cartProducts.filter(product => !existingProductIds.includes(product._id));

			// If all products are already in the cart, send a message


			if (productsToInsert.length === 0) {
				await wishListCollection.deleteMany({})
				return res.status(400).send({ message: 'All products are already in the cart.' });
			}
			// Insert the non-existing products into the cart
			const result = await cartCollection.insertMany(productsToInsert);
			await wishListCollection.deleteMany({})
			res.send(result);

		});


		app.post("/orders",varifyToken , async (req, res) => {
			const orders = req.body;
			const result = await ordersCollection.insertOne(orders);
			res.send(result);

		})


		app.get("/orders", varifyToken ,async (req, res) => {
			const email = req.query.email;
			const query = {
				"customerDetail.email": email,
				status: { $in: ["pending", "completed"] }

			}; // Correct way to construct the query

			const cursor = ordersCollection.find(query).sort({ date: -1 });
			const result = await cursor.toArray();
			res.send(result);
		});

		app.get("/allOrders", varifyToken ,async (req, res) => {
			const cursor = ordersCollection.find().sort({ date: -1 })
			const result = await cursor.toArray()
			res.send(result)
		})


		app.get("/singleOrders/:id",varifyToken , async (req, res) => {

			const id = req.params.id

			const query = { _id: new ObjectId(id) };

			console.log(id, "id")
			const result = await ordersCollection.findOne(query)
			res.send(result)
		})

		app.get("/cancelledOrder",varifyToken , async (req, res) => {
			const email = req.query.email;
			const query = {
				"customerDetail.email": email,
				status: "cancelled"

			}; // Correct way to construct the query

			const cursor = ordersCollection.find(query).sort({ date: -1 });
			const result = await cursor.toArray();
			res.send(result);
		});


		app.put("/order/update/:id", varifyToken , async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			const updatedStatus = req.body.status;
			console.log(id, updatedStatus);

			const result = await ordersCollection.updateOne(query, {
				$set: {
					status: updatedStatus
				},
			});
			res.send(result);

			// console.log(id, updateProduct);
			console.log(result);
		});


		app.put("/completeOrder/update/:id",varifyToken , async (req, res) => {
			const id = req.params.id;
			const body = req.body
			const query = { _id: new ObjectId(id) };

			console.log(id)

			console.log(body)

			body?.productIDandQuantity?.map(async (item) => {

				const id = item?.ProductID
				const query = { _id: new ObjectId(id) }

				console.log(id, item?.quantity)

				const increaseSellCount = await productsCollection.updateOne(query, {
					$set: {
						sellCount: item?.quantity
					},
				});



			});
			const emailQuery = { email: body?.email }

			const makeCustomer = await usersCollection.updateOne(emailQuery, {
				$set: {
					customer: true
				},
			});

			console.log(makeCustomer)

			const result = await ordersCollection.updateOne(query, {
				$set: {
					status: "completed"
				},
			});
			res.send(result);


		});




		// --------------------FlashSale-----------------------

		app.post("/flashSale",varifyToken , async (req, res) => {
			const { startTime, endTime, products, discount } = req.body;

			console.log(products)

			try {
				// Check if there's any flash sale running during the requested time period
				const existingFlashSale = await FlashSaleCollection.findOne({
					$or: [
						{
							startTime: { $lte: endTime },
							endTime: { $gte: startTime }
						}
					]
				});

				if (existingFlashSale) {
					// If an overlapping flash sale exists, reject the request
					return res.status(400).json({ message: 'A flash sale is already running during the specified time period.' });
				}


				// If no overlapping flash sale exists, insert the new flash sale
				const result = await FlashSaleCollection.insertOne({ startTime, endTime, products, discount });

				// add discountPrice property to original products
				const productIds = products?.map(id => new ObjectId(id));

				const productsData = await productsCollection.find({
					_id: { $in: productIds }
				}).toArray();

				const updateOriginalProduct = productsData?.map(async product => {

					const price = product.price
					const discountedPrice = price - (price * (discount / 100))

					const query = { _id: new ObjectId(product._id) };

					await productsCollection.updateOne(query, {
						$set: {
							discountedPrice: discountedPrice
						}
					});

				})

				await Promise.all(updateOriginalProduct);
				res.send(result)


			} catch (error) {
				// Handle any errors that occur during the process
				console.error(error);
				res.status(500).json({ message: 'An error occurred while creating the flash sale.' });
			}
		});

		app.get("/flashSale", async (req, res) => {
			try {
				const currentTime = new Date().toISOString();

				const activeFlashSale = await FlashSaleCollection.findOne({
					startTime: { $lte: currentTime },
					endTime: { $gte: currentTime }
				});

				if (!activeFlashSale) {
					return res.status(404).json({ message: "No active flash sales found." });
				}

				const productIds = activeFlashSale?.products?.map(id => new ObjectId(id));

				const productsData = await productsCollection.find({
					_id: { $in: productIds }
				}).toArray();


				const response = {
					...activeFlashSale,
					products: productsData
				};


				res.json(response);
			} catch (error) {
				console.error(error);
				res.status(500).json({ message: "An error occurred while retrieving the flash sale." });
			}
		});



		// ----------------------coupon----------------------------


		app.post("/coupon",varifyToken , async (req, res) => {
			const coupon = req.body;
			const result = await couponCollection.insertOne(coupon);
			res.send(result);

		})

		app.get("/coupon", varifyToken ,async (req, res) => {
			const cursor = couponCollection.find()
			const result = await cursor.toArray()
			res.send(result)
		})


		app.delete("/coupon/:id",varifyToken , async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			console.log(id)
			const result = couponCollection.deleteOne(query);

			res.send(result);
		});

		app.post("/singleCoupon", async (req, res) => {

			const couponCode = req.body.coupon
			const query = { couponCode: couponCode };

			const coupon = await couponCollection.findOne(query)

			if (coupon) {
				res.json({
					success: true,
					coupon: coupon.couponCode,
					discount: coupon.discount,
				});
			}
			else {
				res.json({
					success: false,
					message: 'Invalid coupon code. Please try again.',
				});
			}



			console.log(coupon)

		})



		app.get("/statistics",varifyToken , async (req, res) => {



			// for dashboard overview page stastics 

			const totalProducts = await productsCollection.estimatedDocumentCount()
			const totalOrder = await ordersCollection.estimatedDocumentCount()
			const totalUsers = await usersCollection.estimatedDocumentCount()
			const totalCompletedOrder = await ordersCollection.countDocuments({ status:  "completed" } );
			const cancelledOrders = await ordersCollection.countDocuments({ status: "cancelled" });
			const pendingOrder =  await ordersCollection.countDocuments({ status: "pending" });

		


			const result = await ordersCollection.aggregate([
				{
					$group: {
						_id: null, // Group all documents together
						totalPrice: { $sum: "$totalPrice" } // Sum the `quantity` field
					}
				},
				{
					$project: {
						_id: 0, // Exclude the `_id` field
						totalPrice: 1 // Include only the `totalQuantity` field
					}
				}
			]).toArray();

			const totalOrderPrice = result.length > 0 ? result[0].totalPrice : 0;


			// for BarChart 

			const BarChartResult = await categoryCollection.aggregate([
				{
					$lookup: {
						from: "productsCollection",          // Collection to join
						localField: "title",                // Field in categoryCollection
						foreignField: "category",           // Field in productCollection
						as: "products"                      // Name for the array of matched products
					}
				},
				{
					$addFields: {
						totalProducts: { $size: "$products" } // Add a new field `totalProducts` with the count of matched products
					}
				},
				{
					$project: {
						_id: 0,                               // Exclude `_id` field
						category: "$title",                   // Rename `title` to `category`
						totalProducts: 1                      // Include `totalProducts` field
					}
				}
			]).toArray();

			res.json({

				overviewData : {
					totalUsers, totalOrder , totalCompletedOrder,  cancelledOrders ,  totalProducts, totalOrderPrice, pendingOrder
				},
				BarChart : BarChartResult,

		})

		})








	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);



// server will respond with this text


app.listen(port, () => {
	console.log(`simple crud is running on ${port}`);
});


