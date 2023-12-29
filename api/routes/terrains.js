var express = require('express');
var router = express.Router();
var db = require('../db')
var hal = require('../hal');


/**
 * Changer le status de disponibilité d'un terrain de badminton
 * Effectuer la mise à jour de la disponibilité d'un terrain : PUT /courts/:name
 */
router.put('/courts/:name', async function (req, res, next) {

    /*  #swagger.summary = "Changer le status de disponibilité d'un terrain"
        #swagger.requestBody = {
        required: true
        }

        #swagger.parameters['pseudo'] = {
            in: 'formData',
            description: 'Le pseudo de l\'utilisateur qui effectue la réservation',
            required: 'true',
            type: 'string',
            format: 'application/x-www-form-urlencoded',
        } 

        #swagger.parameters['name'] = {
            in: 'path',
            description: 'Le nom du terrain pour lequel on souhaite effectuer le changement',
            required: true,
            type: 'string',
            format: 'application/x-www-form-urlencoded',
        }

        #swagger.parameters['availability'] = {
            in: 'formData',
            description: 'La nouvelle valeur de disponibilité (0 pour indisponible et 1 pour disponible',
            required: 'true',
            type: 'boolean',
            format: 'application/x-www-form-urlencoded',
        }
        
        #swagger.parameters['password'] = {
            in: 'formData',
            description: 'Le mot de passe de l'administrateur.ice',
            required: 'true',
            type: 'string',
            format: 'application/x-www-form-urlencoded',
        } 
    */

    const conn = await db.mysql.createConnection(db.dsn);

    //Récupérer l'utilisateur identifié par le pseudo
    let [rows] = await conn.execute(`SELECT pseudo, password, isAdmin FROM User WHERE pseudo = ?`, [req.body.pseudo]);

    if (rows.length === 0 || rows[0].isAdmin === 0) {
        res.status(403).json({ "msg": "Vous n'êtes pas autorisé.e à accéder à cette ressource." });
        return
    }    

    if (rows[0].password !== req.body.password)    
    {
        res.status(401).json({ "msg": "Le mot de passe est incorrect." });
        return
    }


    //Changement de la valeur du champ "availability"
    try {
        const conn = await db.mysql.createConnection(db.dsn);

         //Récuperer le terrain concerné
        let [rows1] = await conn.execute(`SELECT name, availability FROM Court WHERE name=?`, [req.params.name]);

        if (rows1.length === 0) {
            res.status(404).json({ "msg": "Il n'existe aucun terrain à ce nom." });
            return
        } else {
            await conn.execute(`UPDATE Court SET availability = ? WHERE name = ?`, [req.body.availability, req.params.name]);
        }

        const resourceObject = {
            "_links": [{
                "self": hal.halLinkObject(`/courts/${req.params.name}`, 'string'),
                "court": hal.halLinkObject(`/courts/${req.params.name}/reservations`, 'string'),
            }],
            "name": req.body.name,
            "pseudo": req.body.pseudo,
            "availability" : req.body.availability,
            "status": "Changement de disponibilité confirmé",
        }

        res.status(200).json(resourceObject);

    } catch (error) {
        res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
    }
});

module.exports = router;
