-- Insertion d'un jeu de données test
-- Format standard de la chaine de caractère d'un datetime 'YYYY-mm-dd hh:mm:ss'

USE mybad;

DELETE FROM User;
DELETE FROM Court;
DELETE FROM Reservation;

INSERT INTO User(pseudo, password, isAdmin) VALUES
('admybad', 'admybad', 1),
('mabel', NULL, 0);

INSERT INTO Court(name, availability) VALUES
('A', 1),
('B', 1),
('C', 1),
('D', 1);

INSERT INTO Reservation(idReservation, status, date, pseudo, courtName) VALUES 
(1, 1, '2023-12-20 10:00:00', 'mabel', 'A');