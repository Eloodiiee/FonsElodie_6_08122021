//Installer express
const express = require('express');
//Moogose est le module pour utiliser MongoDB
const mongoose = require('mongoose');
//Module de Securité pour protéger les headers
const helmet = require("helmet");
//Module de sécurité contre les attaques XSS 
const xss = require("xss-clean");
// Module Express pour mettre un temps de session limité
const rateLimit = require("express-rate-limit");
//Module pour charger mes variables
const dotenv = require('dotenv');
//Fait en sorte que le cors est plus facile a utiliser
const cors = require('cors');
//Module de Protection  contre les attaques à injection noSql 
const mongoSanitize = require('express-mongo-sanitize');
//Module qui aide a cacher les adresses MongoDB
const path = require("path");
dotenv.config();

const { HIDDEN_TOKEN } = require('./config.json');
//Description des erreurs dans le terminal
const morgan = require("morgan");




const saucesRoutes = require("./routes/sauces");
const userRoutes = require("./routes/user");
const app = express();


  mongoose.connect(HIDDEN_TOKEN,
    { useNewUrlParser: true,
      useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});


//A la place de bodyparser, on utilise le module Express body parser 
app.use(express.json());

app.use(helmet());

app.use(xss());

app.use(mongoSanitize());

app.use(cors());

app.use(morgan("dev"));

const limiter = rateLimit({
  //Une session n'est valide que pendant 15 minutes
  windowMs: 15 * 60 * 1000, 
  //limitation de 100 requêtes par IP
  max: 100
})

app.use(limiter);

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use("/api/sauces", saucesRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;