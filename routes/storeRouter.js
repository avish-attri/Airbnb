const express = require("express");
const storeRouter = express.Router();

const storeController = require("../controllers/storeController");

const isAuthenticated = (req, res, next) => {
  if (req.session.isLoggedIn && req.session.user) {
    return next();
  }
  res.redirect('/login');
};

storeRouter.get("/", storeController.getIndex);
storeRouter.get("/homes", storeController.getHomes);
storeRouter.get("/bookings", isAuthenticated, storeController.getBookings);
storeRouter.get("/favourites", isAuthenticated, storeController.getFavouriteList);

storeRouter.get("/homes/:homeId", storeController.getHomeDetails);
storeRouter.post("/favourites", isAuthenticated, storeController.postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId", isAuthenticated, storeController.postRemoveFromFavourite);
storeRouter.post("/book-home", isAuthenticated, storeController.postBookHome);

module.exports = storeRouter;
