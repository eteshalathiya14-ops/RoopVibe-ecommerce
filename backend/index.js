const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
dotenv.config({ path: __dirname + "/.env" });

const connectDB    = require("./config/connection");
const { ensureUserIndexes } = require("./utils/userIndexes");
const navbarRoutes = require("./routes/navbarroutes");
const homeRoutes   = require("./routes/home.routes");
const authRoutes   = require("./routes/auth.routes");
const filterRoutes = require("./routes/categoryfilter.routes"); 
const offersRoutes = require("./routes/offers.routes");
const addressroutes = require("./routes/address.routes")
const orderRoutes = require("./routes/order.routes");
const adminAuthRoutes = require("./routes/admin.auth.routes");
const supportRoutes = require("./routes/support.routes");
const cartRoutes = require("./routes/cart.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const ReviewRoutes = require("./routes/review.routes");

const app = express();

app.use(cors());

// IMPORTANT: 50mb limit for base64 images uploaded from admin
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/navbar",            navbarRoutes);
app.use("/api/home",              homeRoutes);
app.use("/api/auth",              authRoutes);
app.use("/api/category-filters",  filterRoutes); 
app.use("/api/offers",            offersRoutes);
app.use("/api/address",           addressroutes);
app.use("/api/orders",            orderRoutes);
app.use("/api/admin",             adminAuthRoutes);
app.use("/api/support",          supportRoutes);
app.use("/api/cart",             cartRoutes);
app.use("/api/wishlist",         wishlistRoutes);
app.use("/api/reviews",          ReviewRoutes);



app.get("/", (req, res) => res.json({ ok: true }));

const startServer = async () => {
  try {
    await connectDB();
    await ensureUserIndexes();
    console.log(" MongoDB Connected Successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error(" Failed to start:", error.message);
    process.exit(1);
  }
};

startServer();