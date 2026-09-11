-- ============================================================
-- BIBLIO-KASA
-- Données de démonstration
-- ============================================================

-- ============================================================
-- 1. NETTOYAGE DES DONNÉES
-- ============================================================

TRUNCATE TABLE emprunts, livres, membres, auteurs
RESTART IDENTITY CASCADE;


-- ============================================================
-- 2. AUTEURS
-- ============================================================

INSERT INTO auteurs (nom, prenom)
VALUES
    ('Hugo', 'Victor'),
    ('Camus', 'Albert'),
    ('Orwell', 'George'),
    ('Dumas', 'Alexandre'),
    ('Kourouma', 'Ahmadou'),
    ('Maupassant', 'Guy de'),
    ('Soyinka', 'Wole'),
    ('Achebe', 'Chinua');


-- ============================================================
-- 3. MEMBRES
-- ============================================================

INSERT INTO membres (
    nom,
    prenom,
    email,
    telephone,
    date_inscription,
    actif
)
VALUES
    (
        'Tshimbila',
        'Martin',
        'martin.tshimbila@example.com',
        '+243810000001',
        '2026-01-15',
        TRUE
    ),
    (
        'Kabeya',
        'Jonathan',
        'jonathan.kabeya@example.com',
        '+243810000002',
        '2026-01-20',
        TRUE
    ),
    (
        'Mbuyi',
        'Sarah',
        'sarah.mbuyi@example.com',
        '+243810000003',
        '2026-02-03',
        TRUE
    ),
    (
        'Ilunga',
        'David',
        'david.ilunga@example.com',
        '+243810000004',
        '2026-02-10',
        TRUE
    ),
    (
        'Mukendi',
        'Esther',
        'esther.mukendi@example.com',
        '+243810000005',
        '2026-02-18',
        TRUE
    ),
    (
        'Kalume',
        'Patrick',
        'patrick.kalume@example.com',
        '+243810000006',
        '2026-03-01',
        TRUE
    ),
    (
        'Ngoma',
        'Grace',
        'grace.ngoma@example.com',
        '+243810000007',
        '2026-03-12',
        TRUE
    ),
    (
        'Lukusa',
        'Kevin',
        'kevin.lukusa@example.com',
        '+243810000008',
        '2026-04-05',
        TRUE
    ),
    (
        'Kanku',
        'Rachel',
        'rachel.kanku@example.com',
        '+243810000009',
        '2026-04-15',
        TRUE
    ),
    (
        'Banza',
        'Samuel',
        'samuel.banza@example.com',
        '+243810000010',
        '2026-05-02',
        FALSE
    );


-- ============================================================
-- 4. LIVRES
-- ============================================================

INSERT INTO livres (
    titre,
    auteur_id,
    annee_publication,
    isbn
)
VALUES
    (
        'Les Misérables',
        1,
        1862,
        '9782070409228'
    ),
    (
        'Notre-Dame de Paris',
        1,
        1831,
        '9782253009686'
    ),
    (
        'L''Étranger',
        2,
        1942,
        '9782070360025'
    ),
    (
        'La Peste',
        2,
        1947,
        '9782070360424'
    ),
    (
        '1984',
        3,
        1949,
        '9780451524935'
    ),
    (
        'La Ferme des animaux',
        3,
        1945,
        '9780451526342'
    ),
    (
        'Le Comte de Monte-Cristo',
        4,
        1844,
        '9782253004223'
    ),
    (
        'Les Trois Mousquetaires',
        4,
        1844,
        '9782253003215'
    ),
    (
        'Les Soleils des indépendances',
        5,
        1968,
        '9782708701592'
    ),
    (
        'Allah n''est pas obligé',
        5,
        2000,
        '9782020427856'
    ),
    (
        'Une vie',
        6,
        1883,
        '9782253001660'
    ),
    (
        'Bel-Ami',
        6,
        1885,
        '9782253001684'
    ),
    (
        'The Lion and the Jewel',
        7,
        1959,
        '9780194235367'
    ),
    (
        'Things Fall Apart',
        8,
        1958,
        '9780385474542'
    ),
    (
        'No Longer at Ease',
        8,
        1960,
        '9780385474566'
    );


-- ============================================================
-- 5. EMPRUNTS RETOURNÉS
-- ============================================================

INSERT INTO emprunts (
    membre_id,
    livre_id,
    date_emprunt,
    date_retour_prevue,
    date_retour_effective,
    statut
)
VALUES
    (
        1,
        3,
        '2026-06-01',
        '2026-06-15',
        '2026-06-12',
        'retourne'
    ),
    (
        2,
        5,
        '2026-06-05',
        '2026-06-19',
        '2026-06-18',
        'retourne'
    ),
    (
        3,
        7,
        '2026-06-10',
        '2026-06-24',
        '2026-06-22',
        'retourne'
    ),
    (
        4,
        9,
        '2026-07-01',
        '2026-07-15',
        '2026-07-14',
        'retourne'
    ),
    (
        5,
        11,
        '2026-07-05',
        '2026-07-19',
        '2026-07-17',
        'retourne'
    ),
    (
        6,
        13,
        '2026-07-10',
        '2026-07-24',
        '2026-07-23',
        'retourne'
    );


-- ============================================================
-- 6. EMPRUNTS EN COURS
-- ============================================================

INSERT INTO emprunts (
    membre_id,
    livre_id,
    date_emprunt,
    date_retour_prevue,
    statut
)
VALUES
    (
        1,
        1,
        CURRENT_DATE - INTERVAL '5 days',
        CURRENT_DATE + INTERVAL '9 days',
        'en_cours'
    ),
    (
        2,
        4,
        CURRENT_DATE - INTERVAL '3 days',
        CURRENT_DATE + INTERVAL '11 days',
        'en_cours'
    ),
    (
        3,
        6,
        CURRENT_DATE - INTERVAL '2 days',
        CURRENT_DATE + INTERVAL '12 days',
        'en_cours'
    ),
    (
        4,
        8,
        CURRENT_DATE - INTERVAL '7 days',
        CURRENT_DATE + INTERVAL '7 days',
        'en_cours'
    ),
    (
        5,
        10,
        CURRENT_DATE - INTERVAL '20 days',
        CURRENT_DATE - INTERVAL '6 days',
        'en_cours'
    ),
    (
        6,
        12,
        CURRENT_DATE - INTERVAL '18 days',
        CURRENT_DATE - INTERVAL '4 days',
        'en_cours'
    ),
    (
        7,
        14,
        CURRENT_DATE - INTERVAL '4 days',
        CURRENT_DATE + INTERVAL '10 days',
        'en_cours'
    );


-- ============================================================
-- FIN DU SEED
-- ============================================================