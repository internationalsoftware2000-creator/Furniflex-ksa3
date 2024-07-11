

const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5144;
// import express
// import cors
// create app
// create port


app.use(cors());
app.use(express.json());


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

		// Category collections

		app.get("/categories", async (req, res) => {
			const cursor = categoryCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		app.post("/categories", async (req, res) => {
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

		app.put("/products/update/:id", async (req, res) => {
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

		app.post("/wishlist", async (req, res) => {
			const wishListProduct = req.body;


			console.log('Received wishlist product:', wishListProduct);

			const query = {
				productId: wishListProduct.productId,
				email: wishListProduct.email
			};

			console.log('Query:', query);

			const checkProduct = await wishListCollection.findOne(query);
			console.log("checkpoint" ,checkProduct);

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

		app.get("/wishlist", async (req, res) => {
			const email = req.query.email;
			const query = { email: email };

			const cursor = wishListCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});

		app.get("/wishlistStatus", async (req, res) => {
			const email = req.query.email;
			const id = req.query.id;

			 console.log(email , id)
		
			if(id && email){
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
		

		app.delete("/wishlist/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			console.log(id)

			const result = wishListCollection.deleteOne(query);

			res.send(result);
		});

		// cart 


		app.post("/cart", async (req, res) => {
			const cartProduct = req.body;


			console.log('Received cart product:', cartProduct);

			const query = {
				productId: cartProduct.productId,
				email: cartProduct.email
			};

			console.log('Query:', query);

			const checkProduct = await cartCollection.findOne(query);
			console.log("checkpoint" ,checkProduct);

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

		app.get("/cart", async (req, res) => {
			const email = req.query.email;
			const query = { email: email };

			const cursor = cartCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});

		app.put("/cart/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			const updateProduct = req.body.quantity;
			console.log(id, updateProduct);
			const result = await cartCollection.updateOne(query, {
				$set: {
					quantity : updateProduct
				},
			});
			res.send(result);

			console.log(id, updateProduct);
			console.log(result);
		});
		app.delete("/cart/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			console.log(id)

			const result = cartCollection.deleteOne(query);

			res.send(result);
		});

		app.delete("/allCartItem", async (req, res) => {
		
			const result = await cartCollection.deleteMany({});
			res.send(result);
		});

		app.post("/moveToCart", async (req, res) => {
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


		app.post("/orders" , async (req , res) => {
			const orders = req.body;
			const result = await ordersCollection.insertOne(orders);
			res.send(result);

		})


		app.get("/orders", async (req, res) => {
			const email = req.query.email;
			const query = { 
				"customerDetail.email": email ,
				 status : "pending" || "fulfilled"

			}; // Correct way to construct the query
		
			const cursor = ordersCollection.find(query).sort({ date: -1 });
			const result = await cursor.toArray();
			res.send(result);
		});

		app.get("/cancelledOrder", async (req, res) => {
			const email = req.query.email;
			const query = { 
				"customerDetail.email": email ,
				 status : "cancelled"

			}; // Correct way to construct the query
		
			const cursor = ordersCollection.find(query).sort({ date: -1 });
			const result = await cursor.toArray();
			res.send(result);
		});


		app.put("/order/update/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			const updatedStatus = req.body.status;
			console.log(id, updatedStatus);

			const result = await ordersCollection.updateOne(query, {
				$set: {
					status : updatedStatus
				},
			});
			res.send(result);

			// console.log(id, updateProduct);
			console.log(result);
		});
		






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


