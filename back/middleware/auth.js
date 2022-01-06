
const jwt = require('jsonwebtoken'); //Jsonwebtoken est utilisé pour chiffrer et déchiffrer les tokens

/*********************************************************************************/
//Module d'authentification 
//Cette Fonction, fait que seul le bon utililsateur puisse changer sa sauce 

module.exports = ( req, res, next ) => { 
    try {
        //Je coupe la requête du header pour n'avoir que le TOKEN
        const token = req.headers.authorization.split(' ')[1]; 
        //Le TOKEN est décodé avec la clé secrète
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); 
        //Token de Verification dans un "const"
        const userId = decodedToken.userId; 

        // Si l'ID utilisateur ne correspond pas au TOKEN , un message est envoyé pour indiquer "ID utilisateur invalide"** 
        if (req.body.userId && req.body.userId !== userId) { 
            throw 'Invalid user Id'; 
        } else {
            //Sinon le prochain Middleware est appelé 
            next(); 
        }
    }
    catch {
        res.status(401).json({error: new Error('Invalid Request!')})

    }
}