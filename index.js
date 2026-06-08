const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const SSLCommerzPayment = require("sslcommerz-lts");

const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5144;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://bikroyelectronics.web.app"],
    credentials: true,
  }),
);

app.post(
  "/webhooks",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    let event;
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret,
        );
      } catch (err) {
        console.log(`⚠️ Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }

      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          // Then define and call a method to handle the successful payment intent.
          // handlePaymentIntentSucceeded(paymentIntent);
          break;
        case "payment_method.attached":
          const paymentMethod = event.data.object;
          // Then define and call a method to handle the successful attachment of a PaymentMethod.
          // handlePaymentMethodAttached(paymentMethod);
          break;

        case "checkout.session.completed":
          const checkoutEvent = event.data.object;
          console.log(checkoutEvent);

          try {
            await client.connect();
            // Send a ping to confirm a successful connection
            await client.db("admin").command({ ping: 1 });

            // console.log("event received")
            // console.log(event.data)

            const DB = client.db("UsersDB");
            const orderCollection = DB.collection("ordersCollection");
            const cartCollection = DB.collection("cartCollection");

            const metaData = checkoutEvent.metadata;

            console.log(metaData);

            const updateResult = await orderCollection.updateOne(
              {
                _id: new ObjectId(metaData.orderID),
              },
              {
                $set: {
                  paymentStatus: "completed",
                },
              },
            );

            console.log(updateResult);

            const cartIds = JSON.parse(metaData.cartIDs);
            const objectIDs = cartIds.map(item => new ObjectId(item));

            // console.log(objectIDs);

            const deletedResult = await cartCollection.deleteMany({
              _id: {
                $in: objectIDs,
              },
            });

            console.log(deletedResult);
          } catch (error) {
            console.log(error);
          }

          break;
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a response to acknowledge receipt of the event
      response.json({ received: true });
    }
  },
);

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(cookieParser());

const store_id = process.env.SSL_STORE_ID;
const store_passwd = process.env.SSL_STORE_PASS;
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
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      // httpOnly: true,
      // secure: true,
      // sameSite: "none",
      path: "/",
      maxAge: 360000000,
    })
    .send({ success: true });
});

// res;
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

    const getScore = p => {
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
      .map(item => ({
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

    const bulkOps = products.map(product => ({
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
  const productIds = cartProducts.map(product => product._id);

  const existingProducts = await cartCollection
    .find({ _id: { $in: productIds } })
    .toArray();
  const existingProductIds = existingProducts.map(product => product._id);

  const productsToInsert = cartProducts.filter(
    product => !existingProductIds.includes(product._id),
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

app.post("/orders", verifyToken, async (req, res) => {
  try {
    const data = req.body;

    if (!data.cartData || !Array.isArray(data.cartData)) {
      return res.status(400).json({ message: "Invalid cart data" });
    }

    const cartIDs = data.cartData.map(item => item._id);
    console.log(cartIDs);
    const productObjectIds = data.cartData.map(
      item => new ObjectId(item.productId),
    );
    // console.log(productObjectIds);

    if (productObjectIds.length === 0) {
      return res.status(400).json({ message: "No product IDs provided." });
    }

    const products = await productsCollection
      .find({ _id: { $in: productObjectIds } })
      .toArray();
    // console.log(products);

    // Map the products for fast lookup (converting ObjectId back to string key)
    const productPriceMap = {};
    products.forEach(product => {
      productPriceMap[product._id.toString()] = product.price;
    });

    let totalPrice = 0;
    const newCartData = [];

    // 3. Verify prices and quantities
    for (const item of data.cartData) {
      const dbPrice = productPriceMap[item.productId];

      if (dbPrice === undefined) {
        return res.status(400).json({
          message: `Product with ID ${item.productId} was not found.`,
        });
      }

      const quantity = Number(item.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity specified." });
      }

      totalPrice += dbPrice * quantity;

      newCartData.push({
        cartID: item._id,
        productID: item.productId,
        buyingPrice: Number(dbPrice), // Securely mapped database price
        quantity: quantity,
      });
    }

    // console.log(newCartData);

    const orderPayload = {
      ...data,
      totalPrice: newCartData.reduce((acc, cv) => acc + cv.buyingPrice, 0),
      cartData: newCartData,
      totalPrice: totalPrice,
      paymentStatus: "pending",
      orderStatus: "pending",
      orderDate: new Date(),
    };

    console.log(data.paymentMethod);

    const orderResult = await ordersCollection.insertOne(orderPayload);

    if (orderResult.insertedId) {
      if (data.paymentMethod === "COD") {
        const objectIDs = cartIDs.map(item => new ObjectId(item));

        const deletedResult = await cartCollection.deleteMany({
          _id: {
            $in: objectIDs,
          },
        });

        res.status(201).json({
          message: "Order created successfully",
          orderId: orderResult.insertedId,
          order: orderPayload,
        });
      } else if (data.paymentMethod === "Stripe") {
        // Define the currency in one place to prevent mismatches
        const paymentCurrency = "bdt";

        const products = await Promise.all(
          data.cartData.map(async item => {
            const productInfo = await productsCollection.findOne({
              _id: new ObjectId(item.productId),
            });

            return {
              price_data: {
                currency: paymentCurrency, // Updated to use "bdt"
                product_data: {
                  name: productInfo.title,
                  images: productInfo.imageUrls,
                },
                // Stripe expects BDT in its smallest unit (poisha).
                // Since BDT uses 2 decimal places, multiplying by 100 is correct.
                unit_amount: Math.round(productInfo.price * 100),
              },
              quantity: item.quantity,
            };
          }),
        );

        console.log(products);
        const session = await stripe.checkout.sessions.create({
          line_items: products,
          // currency: paymentCurrency, // Matches the line items ("bdt")
          metadata: {
            orderID: String(orderResult.insertedId),
            cartIDs: JSON.stringify(cartIDs),
          },
          mode: "payment",
          success_url: "http://localhost:5173/payment/success",
        });

        res.status(201).json({
          message: "Order created successfully",
          orderId: orderResult.insertedId,
          order: orderPayload,
          url: session.url,
        });

        console.log(products);
      } else if (data.paymentMethod === "SSL") {
        const totalAmount = orderPayload.totalPrice;
        const transID = orderResult.insertedId.toString(); // Use the database Order ID as the unique Transaction ID

        // Safely pass the cartIDs in the query string so the success handler knows what to delete.
        // Note: Storing cartIDs inside the Order document is generally safer, but this query parameter method works too.
        const encodedCartIds = encodeURIComponent(JSON.stringify(cartIDs));

        const paymentData = {
          total_amount: totalAmount, // If converted from USD to BDT, multiply accordingly (e.g., totalAmount * 120)
          currency: "BDT",
          tran_id: transID,

          // Point these to your Backend server routes
          success_url: `http://localhost:5144/payment/ssl-success/${transID}?cartIds=${encodedCartIds}`,
          fail_url: `http://localhost:5144/payment/ssl-fail/${transID}`,
          cancel_url: `http://localhost:5144/payment/ssl-cancel/${transID}`,
          ipn_url: `http://localhost:5144/payment/ssl-ipn?cartIds=${encodedCartIds}`,

          shipping_method: "Courier",
          // Create a product name string from the cart items
          product_name:
            data.cartData
              ?.map(item => item.productName || "Product")
              .join(", ") || "Order Items",
          product_category: "Retail",
          product_profile: "general",

          // Dynamic customer details from request data
          cus_name: data.customerName || "Customer Name",
          cus_email: data.customerEmail || "customer@example.com",
          cus_add1: data.shippingAddress || "Dhaka",
          cus_add2: "Dhaka",
          cus_city: data.city || "Dhaka",
          cus_state: data.state || "Dhaka",
          cus_postcode: data.postcode || "1000",
          cus_country: "Bangladesh",
          cus_phone: data.phone || "01700000000",
          cus_fax: data.phone || "01700000000",

          ship_name: data.customerName || "Customer Name",
          ship_add1: data.shippingAddress || "Dhaka",
          ship_add2: "Dhaka",
          ship_city: data.city || "Dhaka",
          ship_state: data.state || "Dhaka",
          ship_postcode: data.postcode || "1000",
          ship_country: "Bangladesh",
        };

        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

        sslcz
          .init(paymentData)
          .then(apiResponse => {
            let GatewayPageURL = apiResponse.GatewayPageURL;
            // Return the SSLCommerz gateway payment URL back to the frontend
            res.json({ url: GatewayPageURL });
          })
          .catch(error => {
            console.error("SSLCommerz Initialization Error:", error);
            res
              .status(500)
              .json({ error: "Failed to initialize payment gateway." });
          });
      } else if (data.paymentMethod === "Bkash"){
        console.log("selected bkash")
      }
    }
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "An internal server error occurred." });
  }
});

app.post("/order", async (req, res) => {
  const data = req.body;

  // console.log(da ta);
  const cartIDs = JSON.stringify(data.cartData.map(item => item._id));
  const newCartData = req.body.cartData.map(item => ({
    cartID: item._id,
    productID: item.productDetails._id,
    buyingPrice: item.productDetails.offeredPrice,
    quantity: item.quantity,
  }));

  const orderPayload = {
    ...data,
    cartData: newCartData,
    paymentStatus: "pending",
    orderStatus: "pending",
    orderDate: Date.now(),
  };

  console.log(orderPayload);

  const orderResult = await orderCollection.insertOne(orderPayload);

  if (orderResult.insertedId) {
    if (data.paymentMethod == "COD") {
      res.json({ url: "http://localhost:5173/user/my-order" });
    } else if (data.paymentMethod == "stripe") {
      const products = await Promise.all(
        data.cartData.map(async item => {
          const productInfo = await productCollection.findOne({
            _id: new ObjectId(item.productDetails._id),
          });

          // console.log(productInfo);

          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: productInfo.title,
                images: productInfo.imageUrls,
              },
              unit_amount: productInfo.offeredPrice * 100,
            },
            quantity: item.quantity,
          };
        }),
      );

      console.log(cartIDs);

      const session = await stripe.checkout.sessions.create({
        line_items: products,
        metadata: {
          orderID: String(orderResult.insertedId),
          cartIDs: cartIDs,
        },
        mode: "payment",
        success_url: "http://localhost:5173/success",
      });

      res.json({ url: session.url });
    } else if (data.paymentMethod == "ssl") {
      const store_id = process.env.SSL_STORE_ID;
      const store_passwd = process.env.SSL_STORE_PASS;
      const is_live = false;
      const totalAmount = newCartData.reduce(
        (acc, cv) => acc + parseFloat(cv.buyingPrice),
        0,
      );

      console.log(cartIDs);
      const encodedUrl = encodeURIComponent(cartIDs);
      console.log(encodedUrl);

      const data = {
        total_amount: totalAmount * 122,
        currency: "BDT",
        tran_id: "REF123", // use unique tran_id for each api call
        success_url:
          `http://localhost:3000/success/${orderResult.insertedId}?cartIds=` +
          encodedUrl,
        fail_url: `http://localhost:3000/failed/${orderResult.insertedId}`,
        cancel_url: "http://localhost:3000/cancel",
        ipn_url: "http://localhost:3000/ipn",
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: "Electronic",
        product_profile: "general",
        cus_name: "Customer Name",
        cus_email: "customer@example.com",
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
        value_a: JSON.stringify(cartIDs),
      };

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

      sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway

        // console.log(apiResponse);
        let GatewayPageURL = apiResponse.GatewayPageURL;
        res.json({ url: GatewayPageURL });
        console.log("Redirecting to: ", GatewayPageURL);
      });
    } else {
      res.send({ error: "please select a supported payment method " });
    }
  }
});

app.get("/orders", verifyToken, async (req, res) => {
  const email = req.query.email;

  console.log(`email ${email}`);

  try {
    const response = await ordersCollection
      .find({ "customerDetail.email": email }, { sort: { date: -1 } })
      .toArray();

    const product = await Promise.all(
      response.map(async item => {
        console.log(item);

        const productInfo = await Promise.all(
          item.cartData.map(async item => {
            const result = await productsCollection.findOne({
              _id: new ObjectId(item.productID),
            });

            return {
              ...result,
              quantity: item.quantity,
              buyingPrice: item.price,
            };
          }),
        );

        return {
          ...item,
          products: productInfo,
        };
      }),
    );

    console.log(product);

    res.send(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  console.log(email);
});

// ssl apis updated below

// SSLCommerz Success Route
app.post("/payment/ssl-success/:orderId", async (req, res) => {
  console.log("hit here");
  const { orderId } = req.params;
  const paymentResponse = req.body; // SSLCommerz sends payment data here

  try {
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    // Validate the transaction with SSLCommerz servers
    const validationResult = await sslcz.validate(paymentResponse);

    console.log(validationResult);

    if (validationResult.status === "VALID") {
      const DB = client.db("UsersDB");
      const orderCollection = DB.collection("ordersCollection");
      const cartCollection = DB.collection("cartCollection");

      // 1. Update the order status in the database
      await orderCollection.updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            paymentStatus: "completed",
            sslTransactionId: validationResult.bank_tran_id,
          },
        },
      );

      // 2. Clear the cart
      const cartIdsParam = req.query.cartIds;
      if (cartIdsParam) {
        const cartIds = JSON.parse(decodeURIComponent(cartIdsParam));
        const objectIDs = cartIds.map(id => new ObjectId(id));
        await cartCollection.deleteMany({
          _id: { $in: objectIDs },
        });
      }

      // 3. Redirect the user back to the Frontend success page
      return res.redirect("http://localhost:5173/payment/success");
    } else {
      // Payment validation failed
      return res.redirect(
        `http://localhost:5173/payment/failed?orderId=${orderId}`,
      );
    }
  } catch (error) {
    console.error("Error processing SSLCommerz success response:", error);
    return res.redirect(
      `http://localhost:5173/payment/failed?orderId=${orderId}`,
    );
  }
});

// SSLCommerz Fail Route
app.post("/payment/ssl-fail/:orderId", async (req, res) => {
  const { orderId } = req.params;

  // 1. Log the full payload in your backend terminal to inspect it
  console.log("--- SSLCommerz Failure Callback Payload ---");
  console.log(req.body);
  console.log("-------------------------------------------");

  // 2. Extract the failure reason sent by SSLCommerz
  // 'error' typically contains the error message, 'status' contains the transaction state.
  const failureReason =
    req.body.error || req.body.status || "Unknown payment failure";

  // Optional: Update database to mark order as "failed" here if needed.

  // 3. Send the failure reason to your frontend as a query parameter
  const encodedReason = encodeURIComponent(failureReason);
  return res.redirect(
    `http://localhost:5173/payment/failed?orderId=${orderId}&reason=${encodedReason}`,
  );
});

// SSLCommerz Cancel Route
app.post("/payment/ssl-cancel/:orderId", async (req, res) => {
  const { orderId } = req.params;

  // Optional: Update database to mark order as "cancelled"
  return res.redirect(
    `http://localhost:5173/payment/cancel?orderId=${orderId}`,
  );
});

// ssl apis updated below

// This api is user to cancel placed order by user from user dahsboard
app.put("/order/update/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  const updatedStatus = req.body.status;
  console.log(id, updatedStatus);

  const result = await ordersCollection.updateOne(query, {
    $set: {
      status: updatedStatus,
    },
  });
  res.send(result);

  // console.log(id, updateProduct);
  console.log(result);
});

// to view ordered that has been cancelled by user from user dashboard
app.get("/cancelledOrder", verifyToken, async (req, res) => {
  const email = req.query.email;
  const query = {
    "customerDetail.email": email,
    status: "cancelled",
  }; // Correct way to construct the query

  const cursor = ordersCollection.find(query).sort({ date: -1 });
  const result = await cursor.toArray();
  res.send(result);
});

//  to view all the order from admin panel
app.get("/allOrders", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const response = await ordersCollection.find().toArray();

    const product = await Promise.all(
      response.map(async item => {
        console.log(item);

        const productInfo = await Promise.all(
          item.cartData.map(async item => {
            const result = await productsCollection.findOne({
              _id: new ObjectId(item.productID),
            });

            return {
              ...result,
              quantity: item.quantity,
              buyingPrice: item.buyingPrice,
            };
          }),
        );

        return {
          ...item,
          products: productInfo,
        };
      }),
    );

    console.log(product);

    res.send(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// to view order details on admin panel
app.get("/singleOrders/:id", verifyToken, verifyAdmin, async (req, res) => {
  const id = req.params.id;

  try {
    const response = await ordersCollection.findOne({ _id: new ObjectId(id) });

    const productInfo = await Promise.all(
      response.cartData.map(async item => {
        const result = await productsCollection.findOne({
          _id: new ObjectId(item.productID),
        });

        return {
          ...result,
          quantity: item.quantity,
          buyingPrice: item.buyingPrice,
        };
      }),
    );

    res.send({
      ...response,
      products: productInfo,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// To complete order (pending to completed) from admin panel
app.put("/completeOrder/update/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const query = { _id: new ObjectId(id) };

  console.log(id);

  console.log(body);

  body?.productIDandQuantity?.map(async item => {
    const id = item?.ProductID;
    const query = { _id: new ObjectId(id) };

    console.log(id, item?.quantity);

    const increaseSellCount = await productsCollection.updateOne(query, {
      $set: {
        sellCount: item?.quantity,
      },
    });
  });
  const emailQuery = { email: body?.email };

  const makeCustomer = await usersCollection.updateOne(emailQuery, {
    $set: {
      customer: true,
    },
  });

  console.log(makeCustomer);

  const result = await ordersCollection.updateOne(query, {
    $set: {
      status: "completed",
    },
  });
  res.send(result);
});

// // To post any order from user
// app.post("/orders", verifyToken, async (req, res) => {
//   const orders = req.body;
//   const result = await ordersCollection.insertOne(orders);
//   res.send(result);
// });

// // **IMPORTANT SSLCommerz Fix Note**:
// // The success and fail routes are registered outside, rather than nested dynamically.
// let activeOrders = {}; // Temp store to fetch data during dynamic callbacks

// app.post("/SSL/orders", verifyToken, async (req, res) => {
//   const orders = req.body;
//   const TransID = new ObjectId().toString();

//   // Save the state to lookup in success/failed endpoints
//   activeOrders[TransID] = orders;

//   const productNames = orders.OrderDetails.map((item) => item.title).join(", ");
//   const productCategories = orders.OrderDetails.map(
//     (item) => item.category,
//   ).join(", ");

//   const discountedPrice =
//     orders?.totalPrice - orders?.totalPrice * (orders?.discount / 100);

//   const data = {
//     total_amount: discountedPrice,
//     currency: "BDT",
//     tran_id: TransID,
//     success_url: "https://bikroyelectronics.web.app/payment/success",
//     fail_url: "https://bikroyelectronics.web.app/payment/failed",
//     cancel_url: "http://localhost:3030/cancel",
//     ipn_url: "http://localhost:3030/ipn",
//     shipping_method: orders?.paymentMethod,
//     product_name: productNames,
//     product_category: productCategories,
//     product_profile: "general",
//     cus_name: orders?.customerDetail?.name,
//     cus_email: orders?.customerDetail?.email,
//     cus_add1: orders?.customerDetail?.address,
//     cus_add2: "Dhaka",
//     cus_city: "Dhaka",
//     cus_state: "Dhaka",
//     cus_postcode: "1000",
//     cus_country: "Bangladesh",
//     cus_phone: orders?.customerDetail?.PhoneNumber,
//     cus_fax: "01711111111",
//     ship_name: "Customer Name",
//     ship_add1: orders?.customerDetail?.address,
//     ship_add2: "Dhaka",
//     ship_city: "Dhaka",
//     ship_postcode: 1000,
//     ship_state: "Dhaka",
//     ship_country: "Bangladesh",
//   };

//   const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
//   sslcz
//     .init(data)
//     .then((apiResponse) => {
//       if (apiResponse.GatewayPageURL) {
//         let GatewayPageURL = apiResponse.GatewayPageURL;
//         res.send({ url: GatewayPageURL });
//       } else {
//         res
//           .status(500)
//           .send({ error: "Failed to get the payment gateway URL." });
//       }
//     })
//     .catch((error) => {
//       console.error("Error initializing SSLCommerz:", error);
//       res.status(500).send({ error: "Error initializing SSLCommerz." });
//     });
// });

// // SSLCommerz callback routes defined correctly as static top-level endpoints
// app.post("/payment/success", async (req, res) => {
//   const { tran_id } = req.body;
//   const orders = activeOrders[tran_id];

//   if (!orders) {
//     return res.status(404).send("Order data not found.");
//   }

//   const OrderData = { TransID: tran_id, ...orders };
//   const result = await ordersCollection.insertOne(OrderData);

//   if (result?.acknowledged) {
//     await cartCollection.deleteMany({
//       email: orders?.customerDetail?.email,
//     });
//     delete activeOrders[tran_id]; // clean memory
//     res.redirect("https://bikroyelectronics.web.app/payment/success");
//   } else {
//     res.status(500).send("Database Insertion Failed.");
//   }
// });

// app.post("/payment/failed", async (req, res) => {
//   const { tran_id } = req.body;
//   delete activeOrders[tran_id];
//   res.redirect("https://bikroyelectronics.web.app/payment/failed");
// });

// // to view placed order from user dashboard
// app.get("/orders", verifyToken, async (req, res) => {
//   const email = req.query.email;
//   const query = {
//     "customerDetail.email": email,
//     status: { $in: ["pending", "completed"] },
//   };

//   const cursor = ordersCollection.find(query).sort({ date: -1 });
//   const result = await cursor.toArray();
//   res.send(result);
// });

// // This api is used to cancel placed order by user
// app.put("/order/update/:id", verifyToken, async (req, res) => {
//   const id = req.params.id;
//   const query = { _id: new ObjectId(id) };

//   const updatedStatus = req.body.status;
//   const result = await ordersCollection.updateOne(query, {
//     $set: {
//       status: updatedStatus,
//     },
//   });
//   res.send(result);
// });

// // to view ordered that has been cancelled by user
// app.get("/cancelledOrder", verifyToken, async (req, res) => {
//   const email = req.query.email;
//   const query = {
//     "customerDetail.email": email,
//     status: "cancelled",
//   };

//   const cursor = ordersCollection.find(query).sort({ date: -1 });
//   const result = await cursor.toArray();
//   res.send(result);
// });

// //  to view all the orders from admin panel
// app.get("/allOrders", verifyToken, verifyAdmin, async (req, res) => {
//   const cursor = ordersCollection.find().sort({ date: -1 });
//   const result = await cursor.toArray();
//   res.send(result);
// });

// // to view order details on admin panel
// app.get("/singleOrders/:id", verifyToken, verifyAdmin, async (req, res) => {
//   const id = req.params.id;
//   const query = { _id: new ObjectId(id) };

//   const result = await ordersCollection.findOne(query);
//   res.send(result);
// });

// // To complete order (pending to completed) from admin panel
// app.put("/completeOrder/update/:id", verifyToken, async (req, res) => {
//   const id = req.params.id;
//   const body = req.body;
//   const query = { _id: new ObjectId(id) };

//   body?.productIDandQuantity?.map(async (item) => {
//     const id = item?.ProductID;
//     const query = { _id: new ObjectId(id) };

//     await productsCollection.updateOne(query, {
//       $set: {
//         sellCount: item?.quantity,
//       },
//     });
//   });

//   const emailQuery = { email: body?.email };

//   await usersCollection.updateOne(emailQuery, {
//     $set: {
//       customer: true,
//     },
//   });

//   const result = await ordersCollection.updateOne(query, {
//     $set: {
//       status: "completed",
//     },
//   });
//   res.send(result);
// });

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

    const productIds = products?.map(id => new ObjectId(id));
    const productsData = await productsCollection
      .find({ _id: { $in: productIds } })
      .toArray();

    const updateOriginalProduct = productsData?.map(async product => {
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

    const productIds = activeFlashSale?.products?.map(id => new ObjectId(id));
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

if (require.main === module) {
  const port = process.env.PORT || 5144;
  app.listen(port, () => {
    console.log(`Server running locally on port ${port}`);
  });
}
