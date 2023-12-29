-- Script de création du schéma de la base de données relationnelles
-- Le schéma a été déduit lors de la phase d'analyse et avec l'usage du dictionnaire des données

CREATE DATABASE IF NOT EXISTS mybad CHARACTER SET utf8;
USE mybad;

-- Suppression des clés étrangères pour éviter les erreurs
SET FOREIGN_KEY_CHECKS = 0;

-- Suppression des tables dans l'ordre inverse de leur création
DROP TABLE IF EXISTS Reservation;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Court;

-- Rétablissement des contraintes de clé étrangère
SET FOREIGN_KEY_CHECKS = 1;

-- Création des tables
CREATE TABLE IF NOT EXISTS User (
    pseudo VARCHAR(20) PRIMARY KEY NOT NULL,
    password VARCHAR(30),
    isAdmin BOOLEAN
);

CREATE TABLE IF NOT EXISTS Court (
    name VARCHAR(1) NOT NULL PRIMARY KEY,
    availability BOOLEAN
);

CREATE TABLE IF NOT EXISTS Reservation (
    idReservation INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
    status BOOLEAN,
    date DATETIME,
    pseudo VARCHAR(20) REFERENCES User(pseudo),
    courtName VARCHAR(1) REFERENCES Court(name)
);
