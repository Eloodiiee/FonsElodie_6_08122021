const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require("../middleware/auth");

//Middleware de validation des email , pour faire la verification de l'email  pour se connecter

const emailValid = require('../middleware/emailValid')
const passValid = require ('../middleware/passwordValid') 
router.post('/signup', passValid, emailValid, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;