const express = require("express");
const router = express.Router();

//Voici les middlewares requis
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

//ici est le chemin du controllers des sauces 
const saucesCtrl = require("../controllers/sauces");

// Il faut être inscrit pour avoir l'autorisation de poster, liker ....    

//J'utilise "multer" pour la gestion des images
router.post("/",  auth, multer,saucesCtrl.createSauce);
router.get("/:id", auth, saucesCtrl.getOneSauce);
router.get("/", auth, saucesCtrl.getAllSauce);
//J'utilise  "multer"pour la gestion des modifications images
router.put("/:id", auth, multer, saucesCtrl.modifySauce);
router.delete("/:id", auth, saucesCtrl.deleteSauce);
router.post("/:id/like", auth, saucesCtrl.likesDislikes);


module.exports = router;