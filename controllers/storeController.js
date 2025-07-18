const Home = require("../models/home");
const User = require("../models/user");
const Booking = require("../models/booking");

exports.getIndex = (req, res, next) => {
  console.log("Session Value: ", req.session);
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  });
};

exports.getBookings = async (req, res, next) => {
  const userId = req.session.user._id;
  const bookings = await Booking.find({ user: userId }).populate('home');
  res.render("store/bookings", {
    bookings,
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn, 
    user: req.session.user,
  });
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn, 
    user: req.session.user,
  });
};

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(fav => fav != homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.postBookHome = async (req, res, next) => {
  const homeId = req.body.homeId;
  const userId = req.session.user._id;
  const home = await Home.findById(homeId);

  if (!home) {
    return res.status(404).send("Home not found");
  }

  // Check if already booked
  const existingBooking = await Booking.findOne({ user: userId, home: homeId });
  if (existingBooking) {
    return res.send(`
      <html>
        <head>
          <title>Already Booked</title>
          <link rel="stylesheet" href="/output.css" />
        </head>
        <body class="bg-gray-100">
          <div class="container mx-auto mt-20 text-center">
            <div class="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div class="text-yellow-500 text-6xl mb-4">!</div>
              <h1 class="text-3xl font-bold text-gray-800 mb-4">Already Booked!</h1>
              <p class="text-gray-600 mb-6">You have already booked <strong>${home.houseName}</strong>.</p>
              <a href="/" class="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition duration-300">
                Back to Home
              </a>
            </div>
          </div>
        </body>
      </html>
    `);
  }

  // Save booking
  await Booking.create({ user: userId, home: homeId });

  // Show confirmation
  res.send(`
    <html>
      <head>
        <title>Booking Confirmed</title>
        <link rel="stylesheet" href="/output.css" />
      </head>
      <body class="bg-gray-100">
        <div class="container mx-auto mt-20 text-center">
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div class="text-green-500 text-6xl mb-4">✓</div>
            <h1 class="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed!</h1>
            <p class="text-gray-600 mb-6">Your booking for <strong>${home.houseName}</strong> has been confirmed.</p>
            <a href="/" class="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition duration-300">
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  `);
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn, 
        user: req.session.user,
      });
    }
  });
};
