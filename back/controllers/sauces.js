const Sauce = require("../models/sauce");
const fs = require("fs");


//Fonction pour affiche toutes les sauces
module.exports.getAllSauce = (req, res, next) => {
  // J'utilise la méthode "find" de mongoose pour trouver les sauces dans ma base de données
  Sauce.find()
    //Response envoyée
    .then((sauces) => res.status(200).json(sauces))
    //Sinon je renvoie une erreur 400
    .catch((error) => res.status(400).json({ error }));
};

//Fonction qui affiche une sauce
module.exports.getOneSauce = (req, res, next) => {
  //J'utilise la méthode findOne de mongoose pour trouver seulement une sauce dans ma base de données 
  Sauce.findOne({ _id: req.params.id })
    //Response envoyée
    .then((sauce) => res.status(200).json(sauce))
    //Sinon je renvoie une erreur 404
    .catch((error) => res.status(404).json({ error }));
};

//Fonction pouor créer une sauce
module.exports.createSauce = (req, res, next) => {
  //Je convertie en format JSON 
  const sauceObject = JSON.parse(req.body.sauce);
  //Ici je supprime l'ID 
  delete sauceObject._id;
  //Un nouvel objet sauce est créé
  const sauce = new Sauce({
    ...sauceObject,
 
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,

    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersdisLiked: []
  });
  sauce
    //La sauce est sauvegardé dans la base de données 
    .save()
    //Response 201 envoyée
    .then(() => res.status(201).json({ message: "La Sauce a été enregistrée !" }))
    //Sinon je renvoie une erreur 400
    .catch((error) => res.status(400).json({ error }));
  
};



//Fonction pour modifier une sauce
module.exports.modifySauce = (req, res, next) => {
  //Je vérifie s'il y a une nouvelle image ou non et s'il y en a une nouvelle je la met à jour
  const sauceObject = req.file ? 
  //je convertie les données en format JSON 
  { ...JSON.parse(req.body.sauce), 
    //Ici je gère le format de l'image ==> et si ce n'est le bon je n'accepte pas les données
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}` } : { ...req.body };
  //Je mets à jour la sauce dans ma base de données en vérifiant l'ID 
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    //Response 200 envoyée
    .then(() => res.status(200).json({ message: "La Sauce a été  modifiée" }))
    //Sinon je renvoie une erreur 400
    .catch((error) => res.status(400).json({ error }));
};


//Fonction pour supprimer une sauce

module.exports.deleteSauce = (req, res, next) => {
  console.log(req.params);

  //Je trouve ma sauce avec son ID dans la requête 
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //L'URL de l'image est coupée pour n'avoir que le nom du fichier
      const filename = sauce.imageUrl.split("/images/")[1];
      
      //Avec son nom,je peux maintenant supprimer la sauce 
      fs.unlink(`images/${filename}`, () => {
        //Je supprime la sauce avec la propriété "deleteOne" de MongoDB
        //double vérifications,  l'Id de la sauce et l'Id de l'utilisateur
        Sauce.deleteOne({ _id: req.params.id }, { deleteSauce: req.body.userId})
          //Response 200 envoyée
          .then(() => res.status(200).json({ message: "La Sauce a été supprimée !" }))
          //Sinon je renvoie une erreur 400
          .catch((error) => res.status(400).json({ error }));
      });
    })
    //Sinon je renvoie une erreur 500
    .catch((error) => res.status(500).json({ error }));
};

//Ici je gère les like / dislike
module.exports.likesDislikes = (req, res, next) => {
  //Ici, la valeur de "1" est ici pour indiquer un "like"
  if(req.body.like === 1) {
      //Ici j'utilise "updateOne" pour mettre à jour les sauces 
      Sauce.updateOne(
          //La mise à jour est défini par l'ID de la sauce
          {_id: req.params.id},
          //"$ink" paramètre de MongoDB pour ajouter 1 like
          //"$push" paramètre de MongoDB pour mettre la valeur dans l'array 
          {$inc: {likes: +1}, $push: { usersLiked: req.body.userId}})
          //Response 200 envoyée
          .then(() => res.status(200).json({message : "J'aime cette sauce !"}))
          //Sinon je renvoie une erreur 400
          .catch(error => res.status(400).json({ error }))
  }
  //Ici, la valeur négative "-1" signifie 1 dislike
  else if(req.body.like === -1) {
      //"updateOne" met à jour les likes des sauces 
      Sauce.updateOne(
          //La sauce est définie par son "ID"
          {_id: req.params.id},
          //j'utilise $inc de MongoDB pour incrémenter les dislikes de 1
          {$inc: {dislikes: +1}, $push: {usersDisliked: req.body.userId}})
          //Response 200 envoyée
          .then((sauce) => res.status(200).json({message : "Je n'aime plus cette sauce !"}))
          //Sinon je renvoie une erreur 400
          .catch(error => res.status(400).json({ error }))

  }
  //Si la valeur est égal à 0, ça veut dire que j'annule un like ou un dislike 
  else {
      //Je trouve la sauce par son "ID"
      Sauce.findOne({_id: req.params.id})
      .then(sauce => {
          //La valeur du like est dans l'array de l'utilisateur
          if(sauce.usersLiked.includes(req.body.userId)) {
              //Mise à  jour de la Sauce grâce à "updateOne"
              Sauce.updateOne(
                  //Je supprrime d'abord le like de l'array de l'utilisateur , en utilisant "$pull" de MongoDB
                  {$pull: {usersLiked: req.body.userId,
                  //Je supprime le like
                  $inc: {likes: -1}}})
                  //Response 200 envoyée
                  .then(() => res.status(200).json({message: "J'aime enlevé"}))
                  //Sinon je renvoie une erreur 400
                  .catch(error => res.status(400).json({error})
              )
          }
          //Sinon, si l'utilisateur annule un dislike 
          else if(sauce.usersDisliked.includes(req.body.userId)) {
              //Mise à  jour de la Sauce grâce à "updateOne"
              Sauce.updateOne(
                  //Je supprrime d'abord le  dislikes de l'array de l'utilisateur
                  {$pull: {usersDisliked: req.body.userId, 
                  //Je supprime le dislike
                  $inc: {Dislikes: -1}}})
                  //Response 200 envoyée
                  .then(() => res.status(200).json({message: "Dislike enlevé !"}))
                  //Sinon je renvoie une erreur 400
                  .catch(error => res.status(400).json({error})
              )
          }
      })
  }
};