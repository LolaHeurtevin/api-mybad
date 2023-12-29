var express = require('express');
var router = express.Router();
var db = require('../db')
var hal = require('../hal');
const { checkTokenMiddleware } = require('./authentification');

/**
 * Routing des ressources liées aux réservations de terrains de badminton
 */


/**
 * Réservation d'un terrain de badminton
 * Effectuer une réservation pour un terrain : POST /courts/:name/reservations
 */
router.post('/courts/:name/reservations', async function (req, res, next) {

    /*  #swagger.summary = "Réserver un terrain de badminton"
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
            description: 'Le nom du terrain à réserver',
            required: true,
            type: 'string',
            format: 'application/x-www-form-urlencoded',
        }

        #swagger.parameters['date'] = {
            in: 'formData',
            description: 'La date de réservation',
            required: true,
            type: 'string', 
            format: 'date',
        }

    */

    //Verifier que les données du pseudo, de la date
    if (!req.body.pseudo) {
        res.status(400).json({ "msg": "Merci de fournir un pseudo pour effectuer une réservation." });
    }

    if (!req.body.date) {
        res.status(400).json({ "msg": "Merci de fournir une date à laquelle effectuer la réservation." });
    }

    try {

        const conn = await db.mysql.createConnection(db.dsn);

        //Récupérer l'utilisateur.ice identifié.e par le pseudo
        let [users] = await conn.execute(`SELECT pseudo FROM User WHERE pseudo = ?`, [req.body.pseudo]);

        if (users.length === 0) {
            res.status(403).json({ "msg": "Impossible de vous identifier, vous ne pouvez pas effectuer de réservations." });
            return
        }

        //Vérifier qu'il n'existe pas déjà une réservation sur le même emplacement exactement ou qui overlap sur l'emplacement
        let [rows2] = await conn.execute(`SELECT * FROM Reservation WHERE courtName=? AND date= ?`, [req.params.name, req.body.date]);
        let [rows3] = await conn.execute(`SELECT date FROM Reservation WHERE date BETWEEN ? AND (DATE_ADD(?, INTERVAL 45 MINUTE)) OR (DATE_ADD(date, INTERVAL 45 MINUTE)) BETWEEN ? AND (DATE_ADD(?, INTERVAL 45 MINUTE));`, [req.body.date, req.body.date, req.body.date, req.body.date]);
       
        if (rows2.length !== 0 || rows3.length !==0) {
            res.status(409).json({ "msg": "Nous sommes désolés, le terrain est déjà réservé pour ce jour à cet horaire." });
            return
        }

        //Vérifier si le terrain est disponible (availability)
        let [rows4] = await conn.execute(`SELECT * FROM Court WHERE name= ? AND availability= 1;`, [req.params.name]);

        if (rows4.length === 0) {
            res.status(409).json({ "msg": "Le terrain n'est actuellement pas disponible à la réservation." });
            return
        }

        //Vérifier que le créneau demandé est bien sur la semaine à venir
        let [rows5] = await conn.execute(`SELECT ? BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY);;`, [req.body.date]); 
        
        if (rows5[0] !== 0)
        {
            res.status(400).json({ "msg": "Vous ne pouvez réserver un terrain que pour la semaine à venir." });
            return
        }

        //Vérifier que la date de la réservation correspond aux horaires réservables (du lundi au samedi de 10h à 22h)
        let [rows6] = await conn.execute(`SELECT TIME(?) BETWEEN '10:00:00' AND '22:00:00' AND TIME((DATE_ADD(?, INTERVAL 45 MINUTE))) BETWEEN '10:00:00' AND '22:00:00' AND DAYOFWEEK(?) BETWEEN 2 AND 6`, [req.body.date, req.body.date, req.body.date]);

        if (rows6[0] !== 1)
        {
            res.status(400).json({ "msg": "Les horaires de réservation sont uniquement du lundi au samedi entre 10h et 22h." });
            return
        }

        let [rows7] = await conn.execute(`INSERT INTO Reservation (status, date, pseudo, courtName) VALUES (1, ?, ?, ?)`, [req.body.date, req.body.pseudo, req.params.name]);
        let [rows8] = await conn.execute(`SELECT idReservation FROM Reservation WHERE date= ? AND pseudo=? AND courtName=?;`, [req.body.date, req.body.pseudo, req.params.name]);

        res.set('Content-Type', 'application/hal+json');
        res.status(201);
        res.json({
            "_links": [{
                "self": hal.halLinkObject(`/courts/${req.params.name}/reservations`, 'string'),
                "court": hal.halLinkObject(`/courts/${req.params.name}`, 'string'),
            }],
            "dateBooking": new Date(),
            "for": req.body.pseudo,
            "status": "Réservation confirmée",
            "idReservation (necessaire pour annuler la réservation)" : rows8[0],
        });

    } catch (error) {
        res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
    }

});

/**
 * Annuler la réservation pour un terrain : DELETE /courts/:name/reservation/:id-reservation
 */
router.delete('/courts/:name/reservations/:idReservation', async function (req, res, next) {

    /*  #swagger.summary = "Annuler la réservation d'un terrain de badminton"
        #swagger.requestBody = {
        required: false
    }
        #swagger.parameters['pseudo'] = {
            in: 'formData',
            description: 'Le pseudo de l\'utilisateur qui annule sa réservation',
            required: 'true',
            type: 'string',
            format: 'application/x-www-form-urlencoded',
        } 

        #swagger.parameters['name'] = {
            in: 'path',
            description: 'Le nom du terrain pour lequel on annule la réservation',
            required: 'true',
            type: 'string',
            format: 'application/x-www-form-urlencoded',
        }

        #swagger.parameters['idReservation'] = {
            in: 'path',
            description: 'L\'identifiant de la réservation à annuler',
            required: 'true',
            type: 'string',
            format: 'application/x-www-form-urlencoded',
        }
    */

    //Verifier que l'utilisateur a envoyé son pseudo pour s'identifier
    if (!req.body.pseudo) {
        res.status(400).json({ "msg": "Merci de fournir un pseudo pour annuler votre réservation." });
        return
    }

    try {
        const conn = await db.mysql.createConnection(db.dsn);

        //Récupérer l'utilisateur identifié par le pseudo
        let [rows] = await conn.execute(`SELECT pseudo FROM User WHERE pseudo = ?`, [req.body.pseudo]);

        if (rows.length === 0) {
            res.status(403).json({ "msg": "Impossible de vous identifier, vous ne pouvez pas gérer vos réservations." });
            return
        }

        //Annuler la réservation
        let [rows3] = await conn.execute(`UPDATE Reservation SET statut=0 WHERE idReservation=?`, [req.params.idReservation]);

        res.status(201).json({
            "_links": [{
                "self": hal.halLinkObject(`/courts/${req.params.name}/reservations/${id-reservation}`, 'string'),
                "court": hal.halLinkObject(`/courts/${req.params.name}`, 'string'),
            }],
            "idReservation": req.params.idReservation,
            "pseudo": req.body.pseudo,
            "status": "Réservation annulée",
        });
    } catch (error) {
        res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
    }
});


/**
 * Liste toutes les réservations d'un terrain
 * Réservé à l'administrateur du site
 * Route authentifiée par JSON Web Token (JWT)
 * La fonction middleware checkTokenMiddleware vérifie d'abord la présence et validité du token
 * avant d’exécuter la fonction middleware suivante
 * 
 * Pour cette route, l'utilisateur.ice peut utiliser la partie query de l'URL afin de faire des recherches par pseudo en rajoutant à l'URL ?pseudo={pseudo}
 */
router.get('/courts/:name/reservations', checkTokenMiddleware, async function (req, res, next) {

    /* #swagger.summary = "Lister toutes les réservations d'un terrain"
        #swagger.parameters['name'] = {
            in: 'path',
            description: 'Le nom du terrain pour lequel on annule la réservation',
            required: 'true',
            type: 'string',
            format: 'application/x-www-form-urlencoded',
        }

        #swagger.parameters['pseudo'] = {
            in: 'path',
            description: 'Le pseudo pour lequel on souhaite récupérer la réservation',
            required: 'false',
            type: 'string',
            format: 'application/x-www-form-urlencoded',
        }
    */

    const conn = await db.mysql.createConnection(db.dsn)

    try {
        if (req.query.pseudo)
        {
            const [rows2] = await conn.execute('SELECT * FROM Reservation WHERE courtName = ? AND pseudo= ?', [req.params.name, req.query.pseudo]);

            if (rows2.length === 0) {
                res.status(404).json({ "msg": "Il n'y a aucune réservations à ce nom pour ce terrain." })
                return
            } 
                res.status(200).json({
                    "_links": {
                        "self": { "href": `/courts/${req.params.name}/reservations`},
                        "court": { "href": `/courts/${req.params.name}`}
                    },
                    "_embedded": {
                        "reservations": rows2.map(row2 => hal.mapReservationToResourceObject(row2, req.baseUrl)),
                    },
                    "Auteur.ice de la réservation" : req.query.pseudo,
                    "nbReservations": rows2.length
                })
        } else {
            const [rows] = await conn.execute('SELECT * FROM Reservation WHERE courtName = ?', [req.params.name]);

            if (rows.length === 0) {
                res.status(404).json({ "msg": "Il n'y a aucune réservations pour ce terrain." })
                return
            }

            res.status(200).json({
                "_links": {
                    "self": { "href": `/courts/${req.params.name}/reservations`},
                    "court": { "href": `/courts/${req.params.name}`}
                },
                "_embedded": {
                    "reservations": rows.map(row => hal.mapReservationToResourceObject(row, req.baseUrl)),
                },
                "nbReservations": rows.length
            })
        }

    } catch (error) {
        res.status(500).json({ "msg": "Nous rencontrons des difficultés, merci de réessayer plus tard." });
    }
});

module.exports = router;
