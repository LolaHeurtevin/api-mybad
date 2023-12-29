# API de Système de réservation de terrains de badminton

Une API permettant de réserver des terrains de badminton, de gérer les terrains ainsi que les réservations

## Table des matières

- [Lancer le projet](##lancer-le-projet)
- [Conception](##conception)
  - [Dictionnaire des données](###dictionnaire-des-donnees)
  - [Modèle Conceptuel des Données (MCD)](###modele-conceptuel-des-donnees)
- [Remarques](##remarques)
- [Références](##references)

## Lancer le projet

Pour lancer le projet avec Docker Compose : 

Installer [Docker](https://www.docker.com/get-started/) (la dernière version de Docker contient déjà Compose).

Lancer le projet avec la commande suivante.

~~~
docker-compose up -d
~~~

Une fois le projet lancé :
- Pour accéder à la page d'accueil : localhost:5001
- Pour accéder à la page admin : localhost:5002
- Pour accéder à la base de données : localhost:5003

Pour arrêter le projet

~~~
docker-compose down
~~~

## Conception

On désire mettre en ligne un service de réservation de terrains de badmiton. Un.e utilisateur.ice est identifié.e par un pseudo, et un.e administarteur.ice par un pseudo et un mot de passe.
Il existe un base de données un.e administrateur.ice dont le pseudo et le mot de passe sont 'admybad'.

Les cas d'utilisation définis sont les suivants : 
1. L'utilisateur.ice réserve un terrain à une certaine date et heure.
2. L'utilisateur.ice annule une réservation.
3. Un.e administrateur.ice consulte la liste des réservations effectuées.
4. Un.e administarteur.ice s'identifie.
5. Un.e administrateur.ice modifie le status de disponiblilité d'un terrain.

Seul un.e administrateur.ice peut modifier la disponiblilité d'un terrain. La consultation des réservations se fait avec un JSONWebToken.
Les terrains ne sont réservables que du lundi au samedi de 10h à 22h.

### Dictionnaire des données

Le dictionnaire de données contient toutes les données présentes en base de donnée.

Types de données : 
* Alphabétiques (A)
* Numériques (N)
* Alphanumériques (AN)
* Date (D)
* Booléen (B)

| Désignation | Code | Type | Obligatoire | Commentaires |
|-----------|-----------|-----------|
| Pseudo utilisateur | pseudo | AN | oui | Fait office d'identifiant |
| Mot de passe | password | AN | non | Uniquement pour les administrateur.ice.s |
| Rôle | isAdmin | B | oui |  |
| Nom du terrain | name | A | oui | J’ai choisi d’utiliser le nom du terrain comme identifiant car ça n’aurait pas de sens pour une seule municipalité d’avoir plusieurs terrains portant le même nom |
| Disponibilité d'un terrain | availability | B | oui | |
| Identifiant de la réservation | idReservation | N | oui |  |
| Status de la réservation | status | B | oui | Permet d’introduire un système d’annulation des réservations |
| Date de la réservation | date | D | oui |  |

### Tableau récapitulatif des ressources

| Ressource | URL | Méthode HTTP | Paramètres d'URL/Variations | Commentaires |
|-----------|-----------|-----------|
| Réservation d'un terrain | /courts/{name}/reservations | POST |  |  |
| Annulation de la réservation d'un terrain | /courts/{name}/reservations/{id-reservation} | DELETE | N'est accessible qu'à l'auteur.ice de la réservation car nécessite l'identifiant de la réservation |
| Liste des réservations par terrains | /courts/{name}/reservations | GET | Il est possible de trier les résultats en fonction du pseudo ayant effectué la réservation avec ?pseudo= | Ressource protégée par un JSONWebToken |
| Changer la disponibilité d'un terrain | /courts/{name} | PUT |  | Réservé à un.e amdinistrateur.ice |
| Identification | /login | POST |  | Disponible uniquement pour les administrateur.ice.s |


### Modèle Conceptuel des Données (MCD)

![Diagramme UML de la base de données](/images/mcd.png "Diagramme uml de la base de données").

La base de données est constituée de trois tables : 
- Une table Users qui contient les attributs pseudo (clé primaire), password et isAdmin. L'attribut password n'a de valeur que pour les administrateur.ice.s et a la valeur "NULL" pour les autres.
- Une table Court qui contient les attributs name (clé primaire) et availability. L'attribut availability permet de changer le status du terrain de "réservable" à "non réservable" en fonction des intermpéries.
- Une table Reservation qui contient les attributs id (clé primaire), status, date, pseudo (clé étrangère, fait référence à pseudo (User)) et courtName (clé étrangère, fait référence à name (Court)). L'attribut status permet de garder une trace des réservations qui ont été annulée puisqu'elles sont conservées en bases de données mais en prennant '0' comme valeur pour l'attribut status.

La base de données est trouvable entièrement dans le dossier 'scripts'. 

## Remarques

Quelques jours après avoir commencé l'api, je me suis rendue compte que lorsque je démarrais le projet je ne pouvais plus accéder au localhost et à ce jour je ne sais toujours pas à quoi c'est lié. J'ai donc essayé de continuer le projet en me concentrant uniquement sur le code (que je n'ai malheureusement pas pu tester en conséquence). Sur conseil d'autres étudiants, j'ai essayé de créer un nouveau projet à partir de rien mais je n'ai pas trouvé comment intégrer une base de donnée à ce nouveau projet, et par manque de temps j'ai abandonné l'idée et préféré présenter ce projet, sur lequel j'ai passé le plus de temps. Je joins [ici](https://github.com/LolaHeurtevin/test-api) le lien de ce projet dans le cadre de la documentation des deux semaines que j'ai passé à travailer sur l'API.

J'étais un peu paniquée au debut de ce projet, et je me pensais totalement incapable de réaliser une API. Je me doute que mon projet n'est pas parfait (ne serait-ce parce que je n'arrive pas à le lancer) mais j'ai vraiment beaucoup appris durant les deux semaines sur lesquelles j'ai travaillé dessus, et je suis contente d'en ressortir avec de vraies connaissances pratiques sur la conception et l'implémentation des API.

## Références

Les ressources utilisées pour la réalisation de ce projet sont : 
* La correction de l'API de réservation de billets de concerts sur GitHub disponible [ici] (https://github.com/paul-schuhm/node-rest-api-exam-corrige)
* Le cours de développement API de Paul Schumacher
* Le starter pack api node.js disponible [ici](https://github.com/paul-schuhm/starterpack-api-nodejs)