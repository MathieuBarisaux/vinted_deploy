const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const router = express.Router();

const Offer = require("../models/Offer");

const cloudinary = require("../tools/cloudinary");

// ** creat offer road **
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    if (req.fields.title && req.fields.description && req.fields.price) {
      const newOffer = await new Offer({
        product_name: req.fields.title,
        product_description: req.fields.desciption,
        product_price: req.fields.price,
        product_details: [
          { marque: req.fields.brand },
          { emplacement: req.fields.city },
          { couleur: req.fields.color },
          { taille: req.fields.size },
          { etat: req.fields.condition },
        ],
        owner: req.fields._id,
      });

      await newOffer.save();

      if (req.files.picture) {
        console.log("lol");
        const picture = req.files.picture.path;
        const uploadPicture = await cloudinary.uploader.upload(picture, {
          folder: `/vinted/offers/${newOffer._id}`,
        });

        newOffer.product_image = uploadPicture.secure_url;

        await newOffer.save();
      }

      res.status(200).json(newOffer);
    } else {
      res.status(409).json({ message: "We need more elements" });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// ** delete offer road **
router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    if (req.fields.offerId) {
      const offerToDelete = await Offer.findById(req.fields.offerId);
      console.log(offerToDelete);

      if (req.fields._id._id.toString() == offerToDelete.owner._id.toString()) {
        // Je verifie que l'user est bien celui qui à créé l'annonce
        await Offer.findByIdAndRemove(req.fields.offerId);

        // Je supprime les images dans le dossier correspondant sur cloudinary
        await cloudinary.api.delete_resources_by_prefix(
          `vinted/offers/${req.fields.offerId}`
        );

        //Je supprime le dossier correpondant sur cloudinary
        await cloudinary.api.delete_folder(
          `vinted/offers/${req.fields.offerId}`
        );

        res.status(200).json({ message: "Your offer has been deleted" });
      } else {
        res.status(400).json({
          message: "You can't delete this offer if you don't be the creator",
        });
      }
    } else {
      res.status(400).json({ message: "We need id" });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// ** search offers road **
router.get("/offers", async (req, res) => {
  try {
    let result = {};
    let totalAnnounce = {};

    // Page filter
    const page = req.query.page;
    const pageToSkip = (page - 1) * 2;

    //creat filter for .find()
    let filterProduct = {};

    // Title filter
    const title = req.query.title;
    if (title) {
      filterProduct.product_name = new RegExp(`${title}`, "i");
    }

    // min price filter
    const priceMin = req.query.priceMin;
    const priceMax = req.query.priceMax;
    if (priceMin) {
      filterProduct.product_price = { $gte: priceMin };
    } else if (priceMax) {
      filterProduct.product_price = { $lte: priceMax };
    } else if (priceMin && priceMax) {
      filterProduct.product_price = { $gte: priceMin, $lte: priceMax };
    }

    // SortPrice filter
    const sort = req.query.sort;
    let sortPriceFilter = {};
    if (sort === "price-asc") {
      sortPriceFilter = { product_price: "asc" };
    } else if (sort === "price-desc") {
      sortPriceFilter = { product_price: "desc" };
    }

    // Result
    result = await Offer.find(filterProduct)
      .limit(2)
      .skip(pageToSkip)
      .sort(sortPriceFilter);
    totalAnnounce = await Offer.countDocuments(filterProduct);

    res.status(200).json({ totalAnnounce, result });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// ** search one offer road **
router.get("/offer/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const offerFind = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username email -_id",
    });

    res.status(200).json(offerFind);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
