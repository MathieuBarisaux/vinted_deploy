const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_APY);

const Offer = require("../models/Offer");
const Order = require("../models/Order");

router.post("/pay", async (req, res) => {
  try {
    const { stripeToken, productID, userID } = req.fields;

    const findProductOfBasket = await Offer.findById(productID);
    const productPrice = findProductOfBasket.product_price * 100;
    const totalAmountTransaction = productPrice + 40 + 80;

    const response = await stripe.charges.create({
      amount: totalAmountTransaction,
      currency: "eur",
      description: `Achat de ${findProductOfBasket.product_name}`,
      source: stripeToken,
    });
    console.log(response.status);
    if (response.status === "succeeded") {
      const newOrder = await new Order({
        amount: totalAmountTransaction,
        product: productID,
        custumer: userID,
      });

      await newOrder.save();

      res.status(200).json(response);
    } else {
      res.status(400).json(response);
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
