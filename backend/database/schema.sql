-- ============================================================
-- BIBLIO-KASA
-- Schéma PostgreSQL
-- Akieni Academy - Cohorte 2
-- Projet S14-S15 : Application de gestion de bibliothèque
-- ============================================================

-- ============================================================
-- 1. NETTOYAGE
-- ============================================================

DROP VIEW IF EXISTS v_emprunts_retard CASCADE;
DROP VIEW IF EXISTS v_emprunts_en_cours CASCADE;

DROP TABLE IF EXISTS emprunts CASCADE;
DROP TABLE IF EXISTS livres CASCADE;
DROP TABLE IF EXISTS membres CASCADE;
DROP TABLE IF EXISTS auteurs CASCADE;


-- ============================================================
-- 2. TABLE AUTEURS
-- ============================================================

CREATE TABLE auteurs (
    id SERIAL PRIMARY KEY,

    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),

    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT auteurs_nom_non_vide
        CHECK (LENGTH(TRIM(nom)) > 0)
);


-- ============================================================
-- 3. TABLE MEMBRES
-- ============================================================

CREATE TABLE membres (
    id SERIAL PRIMARY KEY,

    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,

    email VARCHAR(255),
    telephone VARCHAR(30),

    date_inscription DATE NOT NULL DEFAULT CURRENT_DATE,

    actif BOOLEAN NOT NULL DEFAULT TRUE,

    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT membres_nom_non_vide
        CHECK (LENGTH(TRIM(nom)) > 0),

    CONSTRAINT membres_prenom_non_vide
        CHECK (LENGTH(TRIM(prenom)) > 0),

    CONSTRAINT membres_email_unique
        UNIQUE (email)
);


-- ============================================================
-- 4. TABLE LIVRES
-- ============================================================

CREATE TABLE livres (
    id SERIAL PRIMARY KEY,

    titre VARCHAR(255) NOT NULL,

    auteur_id INTEGER NOT NULL,

    annee_publication INTEGER,

    isbn VARCHAR(20),

    statut VARCHAR(20) NOT NULL DEFAULT 'disponible',

    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT livres_titre_non_vide
        CHECK (LENGTH(TRIM(titre)) > 0),

    CONSTRAINT livres_annee_valide
        CHECK (
            annee_publication IS NULL
            OR annee_publication BETWEEN 1000 AND EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
        ),

    CONSTRAINT livres_statut_valide
        CHECK (statut IN ('disponible', 'emprunte')),

    CONSTRAINT livres_auteur_fk
        FOREIGN KEY (auteur_id)
        REFERENCES auteurs(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- ============================================================
-- 5. TABLE EMPRUNTS
-- ============================================================

CREATE TABLE emprunts (
    id SERIAL PRIMARY KEY,

    membre_id INTEGER NOT NULL,
    livre_id INTEGER NOT NULL,

    date_emprunt DATE NOT NULL DEFAULT CURRENT_DATE,
    date_retour_prevue DATE NOT NULL,

    date_retour_effective DATE,

    statut VARCHAR(20) NOT NULL DEFAULT 'en_cours',

    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT emprunts_membre_fk
        FOREIGN KEY (membre_id)
        REFERENCES membres(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT emprunts_livre_fk
        FOREIGN KEY (livre_id)
        REFERENCES livres(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT emprunts_statut_valide
        CHECK (statut IN ('en_cours', 'retourne')),

    CONSTRAINT emprunts_dates_coherentes
        CHECK (date_retour_prevue >= date_emprunt),

    CONSTRAINT emprunts_retour_coherent
        CHECK (
            (statut = 'en_cours' AND date_retour_effective IS NULL)
            OR
            (statut = 'retourne' AND date_retour_effective IS NOT NULL)
        )
);


-- ============================================================
-- 6. INDEX
-- ============================================================

-- Recherche des livres
CREATE INDEX idx_livres_titre
    ON livres (titre);

CREATE INDEX idx_livres_auteur
    ON livres (auteur_id);

CREATE INDEX idx_livres_statut
    ON livres (statut);


-- Recherche des auteurs
CREATE INDEX idx_auteurs_nom
    ON auteurs (nom);


-- Recherche des membres
CREATE INDEX idx_membres_nom
    ON membres (nom);

CREATE INDEX idx_membres_actif
    ON membres (actif);


-- Recherche des emprunts
CREATE INDEX idx_emprunts_membre
    ON emprunts (membre_id);

CREATE INDEX idx_emprunts_livre
    ON emprunts (livre_id);

CREATE INDEX idx_emprunts_statut
    ON emprunts (statut);

CREATE INDEX idx_emprunts_date_retour
    ON emprunts (date_retour_prevue);


-- ============================================================
-- 7. EMPÊCHER PLUSIEURS EMPRUNTS ACTIFS POUR UN MÊME LIVRE
-- ============================================================

CREATE UNIQUE INDEX idx_un_emprunt_actif_par_livre
    ON emprunts (livre_id)
    WHERE statut = 'en_cours';


-- ============================================================
-- 8. TRIGGER : MISE À JOUR AUTOMATIQUE DU STATUT DU LIVRE
-- ============================================================

CREATE OR REPLACE FUNCTION mettre_a_jour_statut_livre()
RETURNS TRIGGER
AS $$
BEGIN

    -- Lorsqu'un emprunt est créé ou passe en cours,
    -- le livre devient emprunté.
    IF NEW.statut = 'en_cours' THEN

        UPDATE livres
        SET
            statut = 'emprunte',
            date_modification = CURRENT_TIMESTAMP
        WHERE id = NEW.livre_id;

    END IF;


    -- Lorsqu'un emprunt est retourné,
    -- le livre redevient disponible.
    IF NEW.statut = 'retourne' THEN

        UPDATE livres
        SET
            statut = 'disponible',
            date_modification = CURRENT_TIMESTAMP
        WHERE id = NEW.livre_id;

    END IF;


    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_statut_livre
AFTER INSERT OR UPDATE OF statut
ON emprunts
FOR EACH ROW
EXECUTE FUNCTION mettre_a_jour_statut_livre();


-- ============================================================
-- 9. TRIGGER : DATE DE MODIFICATION
-- ============================================================

CREATE OR REPLACE FUNCTION mettre_a_jour_date_modification()
RETURNS TRIGGER
AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_auteurs_date_modification
BEFORE UPDATE ON auteurs
FOR EACH ROW
EXECUTE FUNCTION mettre_a_jour_date_modification();


CREATE TRIGGER trigger_membres_date_modification
BEFORE UPDATE ON membres
FOR EACH ROW
EXECUTE FUNCTION mettre_a_jour_date_modification();


CREATE TRIGGER trigger_livres_date_modification
BEFORE UPDATE ON livres
FOR EACH ROW
EXECUTE FUNCTION mettre_a_jour_date_modification();


CREATE TRIGGER trigger_emprunts_date_modification
BEFORE UPDATE ON emprunts
FOR EACH ROW
EXECUTE FUNCTION mettre_a_jour_date_modification();


-- ============================================================
-- 10. VUE : EMPRUNTS EN COURS
-- ============================================================

CREATE OR REPLACE VIEW v_emprunts_en_cours AS
SELECT
    e.id AS emprunt_id,

    e.date_emprunt,
    e.date_retour_prevue,

    m.id AS membre_id,
    m.nom AS membre_nom,
    m.prenom AS membre_prenom,

    l.id AS livre_id,
    l.titre AS livre_titre,

    a.id AS auteur_id,
    a.nom AS auteur_nom,
    a.prenom AS auteur_prenom

FROM emprunts e

INNER JOIN membres m
    ON m.id = e.membre_id

INNER JOIN livres l
    ON l.id = e.livre_id

INNER JOIN auteurs a
    ON a.id = l.auteur_id

WHERE e.statut = 'en_cours';


-- ============================================================
-- 11. VUE : EMPRUNTS EN RETARD
-- ============================================================

CREATE OR REPLACE VIEW v_emprunts_retard AS
SELECT
    e.id AS emprunt_id,

    e.date_emprunt,
    e.date_retour_prevue,

    CURRENT_DATE - e.date_retour_prevue AS jours_retard,

    m.id AS membre_id,
    m.nom AS membre_nom,
    m.prenom AS membre_prenom,

    l.id AS livre_id,
    l.titre AS livre_titre,

    a.id AS auteur_id,
    a.nom AS auteur_nom,
    a.prenom AS auteur_prenom

FROM emprunts e

INNER JOIN membres m
    ON m.id = e.membre_id

INNER JOIN livres l
    ON l.id = e.livre_id

INNER JOIN auteurs a
    ON a.id = l.auteur_id

WHERE
    e.statut = 'en_cours'
    AND e.date_retour_prevue < CURRENT_DATE;


-- ============================================================
-- FIN DU SCHEMA
-- ============================================================
