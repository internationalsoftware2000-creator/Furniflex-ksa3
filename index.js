// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
// require("dotenv").config();
// const SSLCommerzPayment = require("sslcommerz-lts");

// const express = require("express");
// const cors = require("cors");
// const app = express();
// const port = process.env.PORT || 5144;
// // import express
// // import cors
// // create app
// // create port

// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://bikroyelectronics.web.app"],
//     credentials: true,
//   }),
// );
// app.use(express.json());
// app.use(cookieParser());

// // use cors for middleware without using you can't access server
// // The express.json() middleware is used to parse incoming JSON requests

// const store_id = "mycom66d0151478e40";
// const store_passwd = "mycom66d0151478e40@ssl";
// const is_live = false; //true for live, false for sandbox

// app.get("/", (req, res) => {
//   res.send("simple crud is running");
// });

// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const uri = process.env.MONGODB_URI;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     // await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!",
//     );

//     const database = client.db("UsersDB");
//     const usersCollection = database.collection("users");
//     const categoryCollection = database.collection("categoryCollection");
//     const productsCollection = database.collection("productsCollection");
//     const wishListCollection = database.collection("wishListCollection");
//     const cartCollection = database.collection("cartCollection");
//     const ordersCollection = database.collection("ordersCollection");
//     const FlashSaleCollection = database.collection("FlashSaleCollection");
//     const couponCollection = database.collection("couponCollection");

//     // ------------Json Web Token--------------

//     console.log(process.env.SECRET_KEY, "ulla");

//     // Create jwt token
//     app.post("/jwt", async (req, res) => {
//       console.log("tokenn hit for jwt");

//       const result = req.body;
//       console.log(result, "result fo jwt");
//       const token = jwt.sign(result, process.env.SECRET_KEY, {
//         expiresIn: "100h",
//       });

//       res
//         .cookie("token", token, {
//           // httpOnly: true,
//           // secure: false,
//           // sameSite: 'lax',
//           httpOnly: true,
//           secure: true,
//           sameSite: "none",
//           path: "/",
//           maxAge: 360000000,
//         })
//         .send({ success: true });

//       // res.send(token)
//     });

//     // Clear jwt token
//     app.post("/clear", async (req, res) => {
//       console.log("Clearing cookies for user:", req.user);

//       res.clearCookie("token", {
//         httpOnly: true,
//         secure: true,
//         sameSite: "none",
//         path: "/", // Ensure this matches the path used when setting the cookie
//       });

//       res.status(200).json({ message: "Successfully cleared cookie" });
//     });

//     //   jwt middleware
//     const verifyToken = (req, res, next) => {
//       const token = req.cookies.token;

//       // receive the token from cookie which is sent from clint

//       // console.log("value of token in middleware", token);
//       if (!token) {
//         return res.status(401).send({ message: "not authorosized" });
//       }
//       //if the user has no token user will get not authorized message

//       jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
//         if (err) {
//           console.log(err);
//           return res.status(401).send({ message: "error authorized" });
//         }
//         // if user have token but some error happened user will also not get the data

//         // console.log("value in the token", decoded);
//         req.user = decoded;
//         next();
//       });
//     };

//     //------------- Admin varification  -------------------

//     const verifyAdmin = async (req, res, next) => {
//       const email = req.user.email;
//       const query = { email: email };

//       // console.log(email  ,"email form vaify admin middleware")

//       const user = await usersCollection.findOne(query);
//       console.log(user, "user form vaify admin middleware");

//       let admin = user?.role === "admin";

//       if (!admin) {
//         return res.status(403).send({ messege: "forbidden Access" });
//       }

//       next();
//     };

//     // -------------user Management Api -------------------

//     // to get single user detail from my account Page
//     app.get("/user/:email", async (req, res) => {
//       const email = req.params.email;
//       console.log(email, "email from admin check");
//       // if (email) {
//       // }
//       const query = { email: email };
//       const result = await usersCollection.findOne(query);
//       console.log(result);
//       res.send(result);
//     });

//     // To post user Detail while user signup
//     app.post("/users", async (req, res) => {
//       console.log("hit");

//       const user = req.body;

//       console.log(user);
//       console.log(process.env.MONGODB_URI);
//       const existingUser = await usersCollection.findOne({
//         email: user?.email,
//       });

//       if (existingUser) {
//         return res.status(400).send({ message: "User already exists" });
//       }

//       const result = await usersCollection.insertOne(user);
//       res.send(result);
//     });

//     // To update user Detail from My Accout page ( first name , last name , Address)
//     app.put("/users/update", async (req, res) => {
//       const updateUser = req.body;

//       const email = updateUser.email;
//       // const email = req.params.email;
//       const query = { email: email };

//       console.log(email, updateUser);
//       const result = await usersCollection.updateOne(query, {
//         $set: updateUser,
//       });
//       res.send(result);
//       // console.log(id, updateUser);
//     });

//     // To view normal user and customer from admin panel
//     app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
//       const { customer } = req.query;

//       let query = {};
//       if (customer) {
//         query = { customer: true };
//       }
//       console.log(customer);
//       const cursor = usersCollection.find(query);
//       const result = await cursor.toArray();
//       res.send(result);
//     });

//     // To make an user admin of the website by email
//     app.put("/users/role", verifyToken, verifyAdmin, async (req, res) => {
//       const email = req.body.email;

//       // const email = updateUser.email
//       // const email = req.params.email;
//       const query = { email: email };

//       console.log(email);
//       const result = await usersCollection.updateOne(query, {
//         $set: {
//           role: "admin",
//         },
//       });
//       res.send(result);
//       // console.log(id, updateUser);
//     });

//     // --------------Category Management Api---------------------

//     // To view category Items
//     app.get("/categories", async (req, res) => {
//       const cursor = categoryCollection.find();
//       const result = await cursor.toArray();
//       res.send(result);
//     });

//     // To create new category Item
//     app.post("/categories", verifyToken, async (req, res) => {
//       const categories = req.body;
//       const result = await categoryCollection.insertOne(categories);
//       res.send(result);
//     });

//     app.delete("/categories/:id", async (req, res) 	=> {
//       try {
//         const id = req.params.id;

//         const result = await categoryCollection.deleteOne({
//           _id: new ObjectId(id),
//         });

//         if (result.deletedCount === 0) {
//           return res.status(404).send({ message: "Category not found" });
//         }

//         res.send({
//           message: "Category deleted successfully",
//           deletedCount: result.deletedCount,
//         });
//       } catch (error) {
//         res.status(500).send({ message: "Failed to delete category", error });
//       }
//     });

//     //  ---------------Product  Management Api---------------

//     // to post or add any product from admin panel
//     app.post("/products", verifyToken, verifyAdmin, async (req, res) => {
//       const product = req.body;
//       const result = await productsCollection.insertOne(product);
//       res.send(result);
//     });

//     //  to update product detail from admin panel
//     app.put(
//       "/products/update/:id",
//       verifyToken,
//       verifyAdmin,
//       async (req, res) => {
//         const id = req.params.id;
//         const query = { _id: new ObjectId(id) };

//         const updateProduct = req.body.data;
//         console.log(id, updateProduct);
//         const result = await productsCollection.updateOne(query, {
//           $set: updateProduct,
//         });
//         res.send(result);

//         console.log(id, updateProduct);
//       },
//     );

//     // to view all the product from home and allProduct page
//     app.get("/products", async (req, res) => {
//       const {
//         limit,
//         sortBy,
//         sortOrder,
//         categories,
//         minPrice,
//         maxPrice,
//         searchText,
//         page,
//       } = req.query;

//       // Build the query object for MongoDB
//       const query = {};
//       const searchRegex = searchText ? new RegExp(searchText, "i") : null;

//       // Add filters based on query parameters
//       if (categories) {
//         const categoryArray = categories.split(",");
//         query.category = { $in: categoryArray };
//       }

//       if (minPrice && maxPrice) {
//         query.price = {
//           $gte: parseInt(minPrice),
//           $lte: parseInt(maxPrice),
//         };
//       } else if (minPrice) {
//         query.price = { $gte: parseInt(minPrice) };
//       } else if (maxPrice) {
//         query.price = { $lte: parseInt(maxPrice) };
//       }

//       if (searchText) {
//         query.$or = [
//           { title: searchRegex },
//           { description: searchRegex },
//           { price: parseInt(searchText) || 0 },
//           { category: searchRegex },
//         ];
//       }

//       // Sort based on sortBy and sortOrder if provided
//       let sortOptions = {};
//       if (sortBy) {
//         sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
//       }

//       const limitInt = parseInt(limit) || 3000;
//       const pageInt = parseInt(page) || 0;

//       // Execute query with optional limit and sorting
//       let cursor = productsCollection.find(query);

//       if (sortBy) {
//         cursor = cursor.sort(sortOptions);
//       }

//       cursor = cursor.skip(pageInt * limitInt).limit(limitInt);

//       let result = await cursor.toArray();

//       // ================================
//       // 🔥 RELEVANCE SCORING (NEW PART ONLY)
//       // ================================
//       if (searchText) {
//         const text = searchText.toLowerCase();

//         const getScore = (p) => {
//           let score = 0;

//           const title = p.title?.toLowerCase() || "";
//           const category = p.category?.toLowerCase() || "";
//           const description = p.description?.toLowerCase() || "";

//           // CATEGORY = HIGHEST PRIORITY
//           if (category.includes(text)) {
//             score += 100;
//           }

//           // TITLE = HIGH PRIORITY
//           if (title.includes(text)) {
//             score += 50;
//           }

//           // DESCRIPTION = LOW PRIORITY
//           if (description.includes(text)) {
//             score += 10;
//           }

//           return score;
//         };

//         result = result
//           .map((item) => ({
//             ...item,
//             _score: getScore(item),
//           }))
//           .sort((a, b) => b._score - a._score);
//       }

//       res.json(result);
//     });

//     app.get("/fix-sellcount", async (req, res) => {
//       try {
//         const result = await productsCollection.updateMany(
//           {
//             sellCount: { $in: [0, "0"] },
//           },
//           [
//             {
//               $set: {
//                 sellCount: {
//                   $add: [
//                     10,
//                     {
//                       $floor: {
//                         $multiply: [{ $rand: {} }, 81],
//                       },
//                     },
//                   ],
//                 },
//               },
//             },
//           ],
//         );

//         res.json({
//           message: "sellCount updated successfully",
//           matched: result.matchedCount,
//           modified: result.modifiedCount,
//         });
//       } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server error", error: err.message });
//       }
//     });

// 	app.get("/fix-prices", async (req, res) => {
//   try {
//     const products = await productsCollection.find({}).toArray();

//     const bulkOps = products.map((product) => ({
//       updateOne: {
//         filter: { _id: product._id },
//         update: {
//           $set: {
//             price: Number(product.price),
//             discountedPrice: product.discountedPrice
//               ? Number(product.discountedPrice)
//               : product.discountedPrice,
//           },
//         },
//       },
//     }));

//     await productsCollection.bulkWrite(bulkOps);

//     res.send({
//       success: true,
//       message: "All prices updated to number type",
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });
//     // To count how many product are their for pagination in all product page
//     app.get("/productCount", async (req, res) => {
//       const { categories, minPrice, maxPrice, searchText } = req.query;

//       const query = {};
//       const searchRegex = searchText ? new RegExp(searchText, "i") : null;

//       // categories filter
//       if (categories) {
//         const categoryArray = categories.split(",");
//         query.category = { $in: categoryArray };
//       }

//       // price filter
//       if (minPrice && maxPrice) {
//         query.price = {
//           $gte: parseInt(minPrice),
//           $lte: parseInt(maxPrice),
//         };
//       } else if (minPrice) {
//         query.price = { $gte: parseInt(minPrice) };
//       } else if (maxPrice) {
//         query.price = { $lte: parseInt(maxPrice) };
//       }

//       // search filter
//       if (searchText) {
//         query.$or = [
//           { title: searchRegex },
//           { description: searchRegex },
//           { price: parseInt(searchText) || 0 },
//           { category: searchRegex },
//         ];
//       }

//       const count = await productsCollection.countDocuments(query);

//       res.send({ count });
//     });

//     // To view product Detail
//     app.get("/products/:id", async (req, res) => {
//       const id = req.params.id;
//       console.log(id);
//       if (id) {
//         const query = { _id: new ObjectId(id) };
//         const result = await productsCollection.findOne(query);
//         res.send(result);
//       }
//     });

//     //  -------------- Wishlist Management Api --------------------

//     // add product to wishList by user
//     app.post("/wishlist", verifyToken, async (req, res) => {
//       const wishListProduct = req.body;

//       console.log("Received wishlist product:", wishListProduct);

//       const query = {
//         productId: wishListProduct.productId,
//         email: wishListProduct.email,
//       };

//       console.log("Query:", query);

//       const checkProduct = await wishListCollection.findOne(query);
//       console.log("checkpoint", checkProduct);

//       if (!checkProduct) {
//         const result = await wishListCollection.insertOne(wishListProduct);
//         res.send(result);
//       } else {
//         res.status(409).send({
//           message: "Product already exists in the wishlist",
//         });
//       }
//     });

//     // view wishlist product by user
//     app.get("/wishlist", verifyToken, async (req, res) => {
//       const email = req.query.email;
//       const query = { email: email };

//       const cursor = wishListCollection.find(query);
//       const result = await cursor.toArray();
//       res.send(result);
//     });

//     // to check weather a product has been added to wishlist or not
//     app.get("/wishlistStatus", verifyToken, async (req, res) => {
//       const email = req.query.email;
//       const id = req.query.id;

//       console.log(email, id);

//       if (id && email) {
//         const query = {
//           email: email,
//           productId: id,
//         };

//         try {
//           const cursor = await wishListCollection.find(query).toArray();

//           if (cursor.length > 0) {
//             res.send({ wishListed: true });
//           } else {
//             res.send({ wishListed: false });
//           }
//         } catch (error) {
//           console.error("Error checking wishlist status:", error);
//           res.status(500).send({ message: "Internal server error" });
//         }
//       }
//     });

//     // delete product from wishlist
//     app.delete("/wishlist/:id", verifyToken, async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };

//       console.log(id);

//       const result = wishListCollection.deleteOne(query);

//       res.send(result);
//     });

//     // -----------------cart Management api ---------------------

//     // add product to cart by user
//     app.post("/cart", verifyToken, async (req, res) => {
//       const cartProduct = req.body;

//       console.log("Received cart product:", cartProduct);

//       const query = {
//         productId: cartProduct.productId,
//         email: cartProduct.email,
//       };

//       console.log("Query:", query);

//       const checkProduct = await cartCollection.findOne(query);
//       console.log("checkpoint", checkProduct);

//       if (!checkProduct) {
//         const result = await cartCollection.insertOne(cartProduct);
//         res.send(result);
//       } else {
//         res.status(409).send({
//           message: "Product already exists in the cart",
//         });
//       }
//     });

//     // view Cart product by user
//     app.get("/cart", verifyToken, async (req, res) => {
//       const email = req.query.email;
//       const query = { email: email };

//       const token = req.cookies.token;
//       console.log("token is ", token);

//       const cursor = cartCollection.find(query);
//       const result = await cursor.toArray();
//       res.send(result);
//     });

//     // to update cart (increase or decrees product quantity form cart )
//     app.put("/cart/:id", verifyToken, async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };

//       const updateProduct = req.body.quantity;
//       console.log(id, updateProduct);
//       const result = await cartCollection.updateOne(query, {
//         $set: {
//           quantity: updateProduct,
//         },
//       });
//       res.send(result);

//       console.log(id, updateProduct);
//       console.log(result);
//     });

//     // to delete single product from cart
//     app.delete("/cart/:id", verifyToken, async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };

//       console.log(id);

//       const result = cartCollection.deleteOne(query);

//       res.send(result);
//     });

//     // to delete all the product from cart together
//     app.delete("/allCartItem", verifyToken, async (req, res) => {
//       const result = await cartCollection.deleteMany({});
//       res.send(result);
//     });

//     //  To move all the product to cart from wishlist
//     app.post("/moveToCart", verifyToken, async (req, res) => {
//       const cartProducts = req.body;

//       const productIds = cartProducts.map((product) => product._id);

//       // Find the existing products in the cart
//       const existingProducts = await cartCollection
//         .find({ _id: { $in: productIds } })
//         .toArray();
//       const existingProductIds = existingProducts.map((product) => product._id);

//       // Filter out the products that are already in the cart
//       const productsToInsert = cartProducts.filter(
//         (product) => !existingProductIds.includes(product._id),
//       );

//       // If all products are already in the cart, send a message

//       if (productsToInsert.length === 0) {
//         await wishListCollection.deleteMany({});
//         return res
//           .status(400)
//           .send({ message: "All products are already in the cart." });
//       }
//       // Insert the non-existing products into the cart
//       const result = await cartCollection.insertMany(productsToInsert);
//       await wishListCollection.deleteMany({});
//       res.send(result);
//     });

//     // ----------------------Orders Management Api ----------------------

//     // To post any order from user
//     app.post("/orders", verifyToken, async (req, res) => {
//       const orders = req.body;
//       const result = await ordersCollection.insertOne(orders);
//       res.send(result);
//     });

//     app.post("/SSL/orders", verifyToken, async (req, res) => {
//       const orders = req.body;
//       const TransID = new ObjectId().toString();

//       const productNames = orders.OrderDetails.map((item) => item.title).join(
//         ", ",
//       );
//       const productCategories = orders.OrderDetails.map(
//         (item) => item.category,
//       ).join(", ");
//       // const result = await ordersCollection.insertOne(orders);
//       // res.send(result);

//       const discountedPrice =
//         orders?.totalPrice - orders?.totalPrice * (orders?.discount / 100);

//       const data = {
//         total_amount: discountedPrice,
//         currency: "BDT",
//         tran_id: TransID, // use unique tran_id for each api call
//         success_url:
//           "https://bikroyelectronics.web.app/payment/success",
//         fail_url: "https://bikroyelectronics.web.app/payment/failed",
//         cancel_url: "http://localhost:3030/cancel",
//         ipn_url: "http://localhost:3030/ipn",
//         shipping_method: orders?.paymentMethod,
//         product_name: productNames,
//         product_category: productCategories,
//         product_profile: "general",
//         cus_name: orders?.customerDetail?.name,
//         cus_email: orders?.customerDetail?.email,
//         cus_add1: orders?.customerDetail?.address,
//         cus_add2: "Dhaka",
//         cus_city: "Dhaka",
//         cus_state: "Dhaka",
//         cus_postcode: "1000",
//         cus_country: "Bangladesh",
//         cus_phone: orders?.customerDetail?.PhoneNumber,
//         cus_fax: "01711111111",
//         ship_name: "Customer Name",
//         ship_add1: orders?.customerDetail?.address,
//         ship_add2: "Dhaka",
//         ship_city: "Dhaka",
//         ship_postcode: 1000,
//         ship_state: "Dhaka",
//         ship_country: "Bangladesh",
//       };

//       const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
//       sslcz
//         .init(data)
//         .then((apiResponse) => {
//           console.log("API Response:", apiResponse); // Add this line
//           if (apiResponse.GatewayPageURL) {
//             let GatewayPageURL = apiResponse.GatewayPageURL;
//             res.send({ url: GatewayPageURL });
//             console.log("Redirecting to:", GatewayPageURL);
//           } else {
//             res
//               .status(500)
//               .send({ error: "Failed to get the payment gateway URL." });
//           }
//         })
//         .catch((error) => {
//           console.error("Error initializing SSLCommerz:", error);
//           res.status(500).send({ error: "Error initializing SSLCommerz." });
//         });

//       app.post("/payment/success", async (req, res) => {
//         const OrderData = { TransID, ...orders };

//         const result = await ordersCollection.insertOne(OrderData);

//         if (result?.acknowledged) {
//           const result = await cartCollection.deleteMany({
//             email: orders?.customerDetail?.email,
//           });

//           if (result?.acknowledged) {
//             res.redirect("https://bikroyelectronics.web.app/payment/success");
//           }
//         }
//         console.log(result, "success");
//       });

//       app.post("/payment/failed", async (req, res) => {
//         res.redirect("https://bikroyelectronics.web.app/payment/failed");
//       });
//     });

//     // to view placed order from user dashboard
//     app.get("/orders", verifyToken, async (req, res) => {
//       const email = req.query.email;
//       const query = {
//         "customerDetail.email": email,
//         status: { $in: ["pending", "completed"] },
//       }; // Correct way to construct the query

//       const cursor = ordersCollection.find(query).sort({ date: -1 });
//       const result = await cursor.toArray();
//       res.send(result);
//     });

//     // This api is user to cancel placed order by user from user dahsboard
//     app.put("/order/update/:id", verifyToken, async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };

//       const updatedStatus = req.body.status;
//       console.log(id, updatedStatus);

//       const result = await ordersCollection.updateOne(query, {
//         $set: {
//           status: updatedStatus,
//         },
//       });
//       res.send(result);

//       // console.log(id, updateProduct);
//       console.log(result);
//     });

//     // to view ordered that has been cancelled by user from user dashboard
//     app.get("/cancelledOrder", verifyToken, async (req, res) => {
//       const email = req.query.email;
//       const query = {
//         "customerDetail.email": email,
//         status: "cancelled",
//       }; // Correct way to construct the query

//       const cursor = ordersCollection.find(query).sort({ date: -1 });
//       const result = await cursor.toArray();
//       res.send(result);
//     });

//     //  to view all the order from admin panel
//     app.get("/allOrders", verifyToken, verifyAdmin, async (req, res) => {
//       const cursor = ordersCollection.find().sort({ date: -1 });
//       const result = await cursor.toArray();
//       res.send(result);
//     });

//     // to view order details on admin panel
//     app.get("/singleOrders/:id", verifyToken, verifyAdmin, async (req, res) => {
//       const id = req.params.id;

//       const query = { _id: new ObjectId(id) };

//       console.log(id, "id");
//       const result = await ordersCollection.findOne(query);
//       res.send(result);
//     });

//     // To complete order (pending to completed) from admin panel
//     app.put("/completeOrder/update/:id", verifyToken, async (req, res) => {
//       const id = req.params.id;
//       const body = req.body;
//       const query = { _id: new ObjectId(id) };

//       console.log(id);

//       console.log(body);

//       body?.productIDandQuantity?.map(async (item) => {
//         const id = item?.ProductID;
//         const query = { _id: new ObjectId(id) };

//         console.log(id, item?.quantity);

//         const increaseSellCount = await productsCollection.updateOne(query, {
//           $set: {
//             sellCount: item?.quantity,
//           },
//         });
//       });
//       const emailQuery = { email: body?.email };

//       const makeCustomer = await usersCollection.updateOne(emailQuery, {
//         $set: {
//           customer: true,
//         },
//       });

//       console.log(makeCustomer);

//       const result = await ordersCollection.updateOne(query, {
//         $set: {
//           status: "completed",
//         },
//       });
//       res.send(result);
//     });

//     // --------------------FlashSale-----------------------

//     app.post("/flashSale", verifyToken, verifyAdmin, async (req, res) => {
//       const { startTime, endTime, products, discount } = req.body;

//       console.log(products);

//       try {
//         // Check if there's any flash sale running during the requested time period
//         const existingFlashSale = await FlashSaleCollection.findOne({
//           $or: [
//             {
//               startTime: { $lte: endTime },
//               endTime: { $gte: startTime },
//             },
//           ],
//         });

//         if (existingFlashSale) {
//           // If an overlapping flash sale exists, reject the request
//           return res
//             .status(400)
//             .json({
//               message:
//                 "A flash sale is already running during the specified time period.",
//             });
//         }

//         // If no overlapping flash sale exists, insert the new flash sale
//         const result = await FlashSaleCollection.insertOne({
//           startTime,
//           endTime,
//           products,
//           discount,
//         });

//         // add discountPrice property to original products
//         const productIds = products?.map((id) => new ObjectId(id));

//         const productsData = await productsCollection
//           .find({
//             _id: { $in: productIds },
//           })
//           .toArray();

//         const updateOriginalProduct = productsData?.map(async (product) => {
//           const price = product.price;
//           const discountedPrice = price - price * (discount / 100);

//           const query = { _id: new ObjectId(product._id) };

//           await productsCollection.updateOne(query, {
//             $set: {
//               discountedPrice: discountedPrice,
//             },
//           });
//         });

//         await Promise.all(updateOriginalProduct);
//         res.send(result);
//       } catch (error) {
//         // Handle any errors that occur during the process
//         console.error(error);
//         res
//           .status(500)
//           .json({
//             message: "An error occurred while creating the flash sale.",
//           });
//       }
//     });

//     app.get("/flashSale", async (req, res) => {
//       try {
//         const currentTime = new Date().toISOString();

//         const activeFlashSale = await FlashSaleCollection.findOne({
//           startTime: { $lte: currentTime },
//           endTime: { $gte: currentTime },
//         });

//         if (!activeFlashSale) {
//           return res
//             .status(404)
//             .json({ message: "No active flash sales found." });
//         }

//         const productIds = activeFlashSale?.products?.map(
//           (id) => new ObjectId(id),
//         );

//         const productsData = await productsCollection
//           .find({
//             _id: { $in: productIds },
//           })
//           .toArray();

//         const response = {
//           ...activeFlashSale,
//           products: productsData,
//         };

//         res.json(response);
//       } catch (error) {
//         console.error(error);
//         res
//           .status(500)
//           .json({
//             message: "An error occurred while retrieving the flash sale.",
//           });
//       }
//     });

//     // ----------------------coupon----------------------------

//     app.post("/coupon", verifyToken, verifyAdmin, async (req, res) => {
//       const coupon = req.body;
//       const result = await couponCollection.insertOne(coupon);
//       res.send(result);
//     });

//     app.get("/coupon", verifyToken, verifyAdmin, async (req, res) => {
//       const cursor = couponCollection.find();
//       const result = await cursor.toArray();
//       res.send(result);
//     });

//     app.delete("/coupon/:id", verifyToken, verifyAdmin, async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };

//       console.log(id);
//       const result = couponCollection.deleteOne(query);

//       res.send(result);
//     });

//     // This Api is used while user enter coupon number  on cart page to get discount
//     app.post("/singleCoupon", async (req, res) => {
//       const couponCode = req.body.coupon;
//       const query = { couponCode: couponCode };

//       const coupon = await couponCollection.findOne(query);

//       if (coupon) {
//         res.json({
//           success: true,
//           coupon: coupon.couponCode,
//           discount: coupon.discount,
//         });
//       } else {
//         res.json({
//           success: false,
//           message: "Invalid coupon code. Please try again.",
//         });
//       }

//       console.log(coupon);
//     });

//     app.get("/statistics", verifyToken, verifyAdmin, async (req, res) => {
//       // for dashboard overview page stastics

//       const totalProducts = await productsCollection.estimatedDocumentCount();
//       const totalOrder = await ordersCollection.estimatedDocumentCount();
//       const totalUsers = await usersCollection.estimatedDocumentCount();
//       const totalCompletedOrder = await ordersCollection.countDocuments({
//         status: "completed",
//       });
//       const cancelledOrders = await ordersCollection.countDocuments({
//         status: "cancelled",
//       });
//       const pendingOrder = await ordersCollection.countDocuments({
//         status: "pending",
//       });

//       const result = await ordersCollection
//         .aggregate([
//           {
//             $group: {
//               _id: null, // Group all documents together
//               totalPrice: { $sum: "$totalPrice" }, // Sum the `quantity` field
//             },
//           },
//           {
//             $project: {
//               _id: 0, // Exclude the `_id` field
//               totalPrice: 1, // Include only the `totalQuantity` field
//             },
//           },
//         ])
//         .toArray();

//       const totalOrderPrice = result.length > 0 ? result[0].totalPrice : 0;

//       // for BarChart

//       const BarChartResult = await categoryCollection
//         .aggregate([
//           {
//             $lookup: {
//               from: "productsCollection", // Collection to join
//               localField: "title", // Field in categoryCollection
//               foreignField: "category", // Field in productCollection
//               as: "products", // Name for the array of matched products
//             },
//           },
//           {
//             $addFields: {
//               totalProducts: { $size: "$products" }, // Add a new field `totalProducts` with the count of matched products
//             },
//           },
//           {
//             $project: {
//               _id: 0, // Exclude `_id` field
//               category: "$title", // Rename `title` to `category`
//               totalProducts: 1, // Include `totalProducts` field
//             },
//           },
//         ])
//         .toArray();

//       res.json({
//         overviewData: {
//           totalUsers,
//           totalOrder,
//           totalCompletedOrder,
//           cancelledOrders,
//           totalProducts,
//           totalOrderPrice,
//           pendingOrder,
//         },
//         BarChart: BarChartResult,
//       });
//     });
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);

// // server will respond with this text

// // app.listen(port, () => {
// //   console.log(`simple crud is running on ${port}`);
// // });

// module.exports = app;

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const SSLCommerzPayment = require("sslcommerz-lts");

const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5144;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://bikroyelectronics.web.app"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const store_id = "mycom66d0151478e40";
const store_passwd = "mycom66d0151478e40@ssl";
const is_live = false; // true for live, false for sandbox

app.get("/", (req, res) => {
  res.send("simple crud is running");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// 1. Establish database and collection references synchronously at the top level
const database = client.db("UsersDB");
const usersCollection = database.collection("users");
const categoryCollection = database.collection("categoryCollection");
const productsCollection = database.collection("productsCollection");
const wishListCollection = database.collection("wishListCollection");
const cartCollection = database.collection("cartCollection");
const ordersCollection = database.collection("ordersCollection");
const FlashSaleCollection = database.collection("FlashSaleCollection");
const couponCollection = database.collection("couponCollection");

// 2. Run the ping test in a non-blocking, background async IIFE
(async () => {
  try {
    // Note: client.connect() is optional starting in MongoDB Driver v4.7+
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (error) {
    console.error("Failed to connect to MongoDB during startup:", error);
  }
})();

// ==========================================
// ALL ROUTES REGISTERED SYNCHRONOUSLY BELOW
// ==========================================

// ------------Json Web Token--------------

console.log(process.env.SECRET_KEY, "ulla");

// Create jwt token
app.post("/jwt", async (req, res) => {
  console.log("tokenn hit for jwt");

  const result = req.body;
  console.log(result, "result fo jwt");
  const token = jwt.sign(result, process.env.SECRET_KEY, {
    expiresIn: "100h",
  });

  res
    .cookie("token", token, {
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: "none",
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 360000000,
    })
    .send({ success: true });
});

res;
//         .cookie("token", token, {
//           // httpOnly: true,
//           // secure: false,
//           // sameSite: 'lax',
//           httpOnly: true,
//           secure: true,
//           sameSite: "none",
//           path: "/",
//           maxAge: 360000000,
//         })

// Clear jwt token
app.post("/clear", async (req, res) => {
  console.log("Clearing cookies for user:", req.user);

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.status(200).json({ message: "Successfully cleared cookie" });
});

// jwt middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send({ message: "not authorized" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "error authorized" });
    }
    req.user = decoded;
    next();
  });
};

//------------- Admin verification  -------------------

const verifyAdmin = async (req, res, next) => {
  const email = req.user.email;
  const query = { email: email };

  const user = await usersCollection.findOne(query);
  console.log(user, "user from verify admin middleware");

  let admin = user?.role === "admin";

  if (!admin) {
    return res.status(403).send({ message: "forbidden Access" });
  }

  next();
};

// -------------user Management Api -------------------

// to get single user detail from my account Page
app.get("/user/:email", async (req, res) => {
  const email = req.params.email;
  console.log(email, "email from admin check");
  const query = { email: email };
  const result = await usersCollection.findOne(query);
  console.log(result);
  res.send(result);
});

// To post user Detail while user signup
app.post("/users", async (req, res) => {
  console.log("hit");

  const user = req.body;

  const existingUser = await usersCollection.findOne({
    email: user?.email,
  });

  if (existingUser) {
    return res.status(400).send({ message: "User already exists" });
  }

  const result = await usersCollection.insertOne(user);
  res.send(result);
});

// To update user Detail from My Account page
app.put("/users/update", async (req, res) => {
  const updateUser = req.body;
  const email = updateUser.email;
  const query = { email: email };

  const result = await usersCollection.updateOne(query, {
    $set: updateUser,
  });
  res.send(result);
});

// To view normal user and customer from admin panel
app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  const { customer } = req.query;

  let query = {};
  if (customer) {
    query = { customer: true };
  }
  const cursor = usersCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
});

// To make an user admin of the website by email
app.put("/users/role", verifyToken, verifyAdmin, async (req, res) => {
  const email = req.body.email;
  const query = { email: email };

  const result = await usersCollection.updateOne(query, {
    $set: {
      role: "admin",
    },
  });
  res.send(result);
});

// --------------Category Management Api---------------------

// To view category Items
app.get("/categories", async (req, res) => {
  const cursor = categoryCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

// To create new category Item
app.post("/categories", verifyToken, async (req, res) => {
  const categories = req.body;
  const result = await categoryCollection.insertOne(categories);
  res.send(result);
});

app.delete("/categories/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await categoryCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Category not found" });
    }

    res.send({
      message: "Category deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to delete category", error });
  }
});

//  ---------------Product  Management Api---------------

// to post or add any product from admin panel
app.post("/products", verifyToken, verifyAdmin, async (req, res) => {
  const product = req.body;
  const result = await productsCollection.insertOne(product);
  res.send(result);
});

//  to update product detail from admin panel
app.put("/products/update/:id", verifyToken, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  const updateProduct = req.body.data;
  const result = await productsCollection.updateOne(query, {
    $set: updateProduct,
  });
  res.send(result);
});

// to view all the product from home and allProduct page
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

  const query = {};
  const searchRegex = searchText ? new RegExp(searchText, "i") : null;

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

  let sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
  }

  const limitInt = parseInt(limit) || 3000;
  const pageInt = parseInt(page) || 0;

  let cursor = productsCollection.find(query);

  if (sortBy) {
    cursor = cursor.sort(sortOptions);
  }

  cursor = cursor.skip(pageInt * limitInt).limit(limitInt);

  let result = await cursor.toArray();

  if (searchText) {
    const text = searchText.toLowerCase();

    const getScore = (p) => {
      let score = 0;
      const title = p.title?.toLowerCase() || "";
      const category = p.category?.toLowerCase() || "";
      const description = p.description?.toLowerCase() || "";

      if (category.includes(text)) {
        score += 100;
      }
      if (title.includes(text)) {
        score += 50;
      }
      if (description.includes(text)) {
        score += 10;
      }
      return score;
    };

    result = result
      .map((item) => ({
        ...item,
        _score: getScore(item),
      }))
      .sort((a, b) => b._score - a._score);
  }

  res.json(result);
});

app.get("/fix-sellcount", async (req, res) => {
  try {
    const result = await productsCollection.updateMany(
      {
        sellCount: { $in: [0, "0"] },
      },
      [
        {
          $set: {
            sellCount: {
              $add: [
                10,
                {
                  $floor: {
                    $multiply: [{ $rand: {} }, 81],
                  },
                },
              ],
            },
          },
        },
      ],
    );

    res.json({
      message: "sellCount updated successfully",
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/fix-prices", async (req, res) => {
  try {
    const products = await productsCollection.find({}).toArray();

    const bulkOps = products.map((product) => ({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            price: Number(product.price),
            discountedPrice: product.discountedPrice
              ? Number(product.discountedPrice)
              : product.discountedPrice,
          },
        },
      },
    }));

    await productsCollection.bulkWrite(bulkOps);

    res.send({
      success: true,
      message: "All prices updated to number type",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// To count how many product there are for pagination
app.get("/productCount", async (req, res) => {
  const { categories, minPrice, maxPrice, searchText } = req.query;

  const query = {};
  const searchRegex = searchText ? new RegExp(searchText, "i") : null;

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

  const count = await productsCollection.countDocuments(query);
  res.send({ count });
});

// To view product Detail
app.get("/products/:id", async (req, res) => {
  const id = req.params.id;
  if (id) {
    const query = { _id: new ObjectId(id) };
    const result = await productsCollection.findOne(query);
    res.send(result);
  }
});

//  -------------- Wishlist Management Api --------------------

// add product to wishlist by user
app.post("/wishlist", verifyToken, async (req, res) => {
  const wishListProduct = req.body;
  const query = {
    productId: wishListProduct.productId,
    email: wishListProduct.email,
  };

  const checkProduct = await wishListCollection.findOne(query);

  if (!checkProduct) {
    const result = await wishListCollection.insertOne(wishListProduct);
    res.send(result);
  } else {
    res.status(409).send({
      message: "Product already exists in the wishlist",
    });
  }
});

// view wishlist product by user
app.get("/wishlist", verifyToken, async (req, res) => {
  const email = req.query.email;
  const query = { email: email };

  const cursor = wishListCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
});

// to check whether a product has been added to wishlist or not
app.get("/wishlistStatus", verifyToken, async (req, res) => {
  const email = req.query.email;
  const id = req.query.id;

  if (id && email) {
    const query = {
      email: email,
      productId: id,
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

// delete product from wishlist
app.delete("/wishlist/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  const result = await wishListCollection.deleteOne(query);
  res.send(result);
});

// -----------------cart Management api ---------------------

// add product to cart by user
app.post("/cart", verifyToken, async (req, res) => {
  const cartProduct = req.body;
  const query = {
    productId: cartProduct.productId,
    email: cartProduct.email,
  };

  const checkProduct = await cartCollection.findOne(query);

  if (!checkProduct) {
    const result = await cartCollection.insertOne(cartProduct);
    res.send(result);
  } else {
    res.status(409).send({
      message: "Product already exists in the cart",
    });
  }
});

// view Cart product by user
app.get("/cart", verifyToken, async (req, res) => {
  const email = req.query.email;
  const query = { email: email };

  const cursor = cartCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
});

// to update cart quantity
app.put("/cart/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  const updateProduct = req.body.quantity;
  const result = await cartCollection.updateOne(query, {
    $set: {
      quantity: updateProduct,
    },
  });
  res.send(result);
});

// to delete single product from cart
app.delete("/cart/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  const result = await cartCollection.deleteOne(query);
  res.send(result);
});

// to delete all the product from cart together
app.delete("/allCartItem", verifyToken, async (req, res) => {
  const result = await cartCollection.deleteMany({});
  res.send(result);
});

//  To move all the product to cart from wishlist
app.post("/moveToCart", verifyToken, async (req, res) => {
  const cartProducts = req.body;
  const productIds = cartProducts.map((product) => product._id);

  const existingProducts = await cartCollection
    .find({ _id: { $in: productIds } })
    .toArray();
  const existingProductIds = existingProducts.map((product) => product._id);

  const productsToInsert = cartProducts.filter(
    (product) => !existingProductIds.includes(product._id),
  );

  if (productsToInsert.length === 0) {
    await wishListCollection.deleteMany({});
    return res
      .status(400)
      .send({ message: "All products are already in the cart." });
  }

  const result = await cartCollection.insertMany(productsToInsert);
  await wishListCollection.deleteMany({});
  res.send(result);
});

// ----------------------Orders Management Api ----------------------

// To post any order from user
app.post("/orders", verifyToken, async (req, res) => {
  const orders = req.body;
  const result = await ordersCollection.insertOne(orders);
  res.send(result);
});

// **IMPORTANT SSLCommerz Fix Note**:
// The success and fail routes are registered outside, rather than nested dynamically.
let activeOrders = {}; // Temp store to fetch data during dynamic callbacks

app.post("/SSL/orders", verifyToken, async (req, res) => {
  const orders = req.body;
  const TransID = new ObjectId().toString();

  // Save the state to lookup in success/failed endpoints
  activeOrders[TransID] = orders;

  const productNames = orders.OrderDetails.map((item) => item.title).join(", ");
  const productCategories = orders.OrderDetails.map(
    (item) => item.category,
  ).join(", ");

  const discountedPrice =
    orders?.totalPrice - orders?.totalPrice * (orders?.discount / 100);

  const data = {
    total_amount: discountedPrice,
    currency: "BDT",
    tran_id: TransID,
    success_url: "https://bikroyelectronics.web.app/payment/success",
    fail_url: "https://bikroyelectronics.web.app/payment/failed",
    cancel_url: "http://localhost:3030/cancel",
    ipn_url: "http://localhost:3030/ipn",
    shipping_method: orders?.paymentMethod,
    product_name: productNames,
    product_category: productCategories,
    product_profile: "general",
    cus_name: orders?.customerDetail?.name,
    cus_email: orders?.customerDetail?.email,
    cus_add1: orders?.customerDetail?.address,
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: orders?.customerDetail?.PhoneNumber,
    cus_fax: "01711111111",
    ship_name: "Customer Name",
    ship_add1: orders?.customerDetail?.address,
    ship_add2: "Dhaka",
    ship_city: "Dhaka",
    ship_postcode: 1000,
    ship_state: "Dhaka",
    ship_country: "Bangladesh",
  };

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  sslcz
    .init(data)
    .then((apiResponse) => {
      if (apiResponse.GatewayPageURL) {
        let GatewayPageURL = apiResponse.GatewayPageURL;
        res.send({ url: GatewayPageURL });
      } else {
        res
          .status(500)
          .send({ error: "Failed to get the payment gateway URL." });
      }
    })
    .catch((error) => {
      console.error("Error initializing SSLCommerz:", error);
      res.status(500).send({ error: "Error initializing SSLCommerz." });
    });
});

// SSLCommerz callback routes defined correctly as static top-level endpoints
app.post("/payment/success", async (req, res) => {
  const { tran_id } = req.body;
  const orders = activeOrders[tran_id];

  if (!orders) {
    return res.status(404).send("Order data not found.");
  }

  const OrderData = { TransID: tran_id, ...orders };
  const result = await ordersCollection.insertOne(OrderData);

  if (result?.acknowledged) {
    await cartCollection.deleteMany({
      email: orders?.customerDetail?.email,
    });
    delete activeOrders[tran_id]; // clean memory
    res.redirect("https://bikroyelectronics.web.app/payment/success");
  } else {
    res.status(500).send("Database Insertion Failed.");
  }
});

app.post("/payment/failed", async (req, res) => {
  const { tran_id } = req.body;
  delete activeOrders[tran_id];
  res.redirect("https://bikroyelectronics.web.app/payment/failed");
});

// to view placed order from user dashboard
app.get("/orders", verifyToken, async (req, res) => {
  const email = req.query.email;
  const query = {
    "customerDetail.email": email,
    status: { $in: ["pending", "completed"] },
  };

  const cursor = ordersCollection.find(query).sort({ date: -1 });
  const result = await cursor.toArray();
  res.send(result);
});

// This api is used to cancel placed order by user
app.put("/order/update/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  const updatedStatus = req.body.status;
  const result = await ordersCollection.updateOne(query, {
    $set: {
      status: updatedStatus,
    },
  });
  res.send(result);
});

// to view ordered that has been cancelled by user
app.get("/cancelledOrder", verifyToken, async (req, res) => {
  const email = req.query.email;
  const query = {
    "customerDetail.email": email,
    status: "cancelled",
  };

  const cursor = ordersCollection.find(query).sort({ date: -1 });
  const result = await cursor.toArray();
  res.send(result);
});

//  to view all the orders from admin panel
app.get("/allOrders", verifyToken, verifyAdmin, async (req, res) => {
  const cursor = ordersCollection.find().sort({ date: -1 });
  const result = await cursor.toArray();
  res.send(result);
});

// to view order details on admin panel
app.get("/singleOrders/:id", verifyToken, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  const result = await ordersCollection.findOne(query);
  res.send(result);
});

// To complete order (pending to completed) from admin panel
app.put("/completeOrder/update/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const query = { _id: new ObjectId(id) };

  body?.productIDandQuantity?.map(async (item) => {
    const id = item?.ProductID;
    const query = { _id: new ObjectId(id) };

    await productsCollection.updateOne(query, {
      $set: {
        sellCount: item?.quantity,
      },
    });
  });

  const emailQuery = { email: body?.email };

  await usersCollection.updateOne(emailQuery, {
    $set: {
      customer: true,
    },
  });

  const result = await ordersCollection.updateOne(query, {
    $set: {
      status: "completed",
    },
  });
  res.send(result);
});

// --------------------FlashSale-----------------------

app.post("/flashSale", verifyToken, verifyAdmin, async (req, res) => {
  const { startTime, endTime, products, discount } = req.body;

  try {
    const existingFlashSale = await FlashSaleCollection.findOne({
      $or: [
        {
          startTime: { $lte: endTime },
          endTime: { $gte: startTime },
        },
      ],
    });

    if (existingFlashSale) {
      return res.status(400).json({
        message:
          "A flash sale is already running during the specified time period.",
      });
    }

    const result = await FlashSaleCollection.insertOne({
      startTime,
      endTime,
      products,
      discount,
    });

    const productIds = products?.map((id) => new ObjectId(id));
    const productsData = await productsCollection
      .find({ _id: { $in: productIds } })
      .toArray();

    const updateOriginalProduct = productsData?.map(async (product) => {
      const price = product.price;
      const discountedPrice = price - price * (discount / 100);
      const query = { _id: new ObjectId(product._id) };

      await productsCollection.updateOne(query, {
        $set: {
          discountedPrice: discountedPrice,
        },
      });
    });

    await Promise.all(updateOriginalProduct);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while creating the flash sale.",
    });
  }
});

app.get("/flashSale", async (req, res) => {
  try {
    const currentTime = new Date().toISOString();

    const activeFlashSale = await FlashSaleCollection.findOne({
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime },
    });

    if (!activeFlashSale) {
      return res.status(404).json({ message: "No active flash sales found." });
    }

    const productIds = activeFlashSale?.products?.map((id) => new ObjectId(id));
    const productsData = await productsCollection
      .find({ _id: { $in: productIds } })
      .toArray();

    const response = {
      ...activeFlashSale,
      products: productsData,
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while retrieving the flash sale.",
    });
  }
});

// ----------------------coupon----------------------------

app.post("/coupon", verifyToken, verifyAdmin, async (req, res) => {
  const coupon = req.body;
  const result = await couponCollection.insertOne(coupon);
  res.send(result);
});

app.get("/coupon", verifyToken, verifyAdmin, async (req, res) => {
  const cursor = couponCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

app.delete("/coupon/:id", verifyToken, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  const result = await couponCollection.deleteOne(query);
  res.send(result);
});

app.post("/singleCoupon", async (req, res) => {
  const couponCode = req.body.coupon;
  const query = { couponCode: couponCode };

  const coupon = await couponCollection.findOne(query);

  if (coupon) {
    res.json({
      success: true,
      coupon: coupon.couponCode,
      discount: coupon.discount,
    });
  } else {
    res.json({
      success: false,
      message: "Invalid coupon code. Please try again.",
    });
  }
});

app.get("/statistics", verifyToken, verifyAdmin, async (req, res) => {
  const totalProducts = await productsCollection.estimatedDocumentCount();
  const totalOrder = await ordersCollection.estimatedDocumentCount();
  const totalUsers = await usersCollection.estimatedDocumentCount();
  const totalCompletedOrder = await ordersCollection.countDocuments({
    status: "completed",
  });
  const cancelledOrders = await ordersCollection.countDocuments({
    status: "cancelled",
  });
  const pendingOrder = await ordersCollection.countDocuments({
    status: "pending",
  });

  const result = await ordersCollection
    .aggregate([
      {
        $group: {
          _id: null,
          totalPrice: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          _id: 0,
          totalPrice: 1,
        },
      },
    ])
    .toArray();

  const totalOrderPrice = result.length > 0 ? result[0].totalPrice : 0;

  const BarChartResult = await categoryCollection
    .aggregate([
      {
        $lookup: {
          from: "productsCollection",
          localField: "title",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $addFields: {
          totalProducts: { $size: "$products" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$title",
          totalProducts: 1,
        },
      },
    ])
    .toArray();

  res.json({
    overviewData: {
      totalUsers,
      totalOrder,
      totalCompletedOrder,
      cancelledOrders,
      totalProducts,
      totalOrderPrice,
      pendingOrder,
    },
    BarChart: BarChartResult,
  });
});

module.exports = app;
