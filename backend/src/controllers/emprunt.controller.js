const pool = require('../config/database');

const empruntSelect = `
  SELECT
    e.id,
    e.membre_id,
    m.nom AS membre_nom,
    m.prenom AS membre_prenom,
    e.livre_id,
    l.titre AS livre_titre,
    a.id AS auteur_id,
    a.nom AS auteur_nom,
    a.prenom AS auteur_prenom,
    e.date_emprunt,
    e.date_retour_prevue,
    e.date_retour_effective,
    e.statut,
    e.date_creation,
    e.date_modification
  FROM emprunts e
  INNER JOIN membres m ON m.id = e.membre_id
  INNER JOIN livres l ON l.id = e.livre_id
  INNER JOIN auteurs a ON a.id = l.auteur_id
`;

const getAllEmprunts = async (req, res, next) => {
  try {
    const result = await pool.query(`
      ${empruntSelect}
      ORDER BY e.date_emprunt DESC, e.id DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

const getEmpruntById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        ${empruntSelect}
        WHERE e.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emprunt introuvable',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const createEmprunt = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const {
      membre_id,
      livre_id,
      date_retour_prevue,
    } = req.body;

    await client.query('BEGIN');

    // 1. Vérifier le membre
    const membreResult = await client.query(
      `
        SELECT
          id,
          actif
        FROM membres
        WHERE id = $1
        FOR UPDATE
      `,
      [membre_id]
    );

    if (membreResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        success: false,
        message: 'Membre introuvable',
      });
    }

    if (!membreResult.rows[0].actif) {
      await client.query('ROLLBACK');

      return res.status(409).json({
        success: false,
        message: 'Ce membre est inactif et ne peut pas emprunter de livre',
      });
    }

    // 2. Vérifier le livre
    const livreResult = await client.query(
      `
        SELECT
          id,
          statut
        FROM livres
        WHERE id = $1
        FOR UPDATE
      `,
      [livre_id]
    );

    if (livreResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        success: false,
        message: 'Livre introuvable',
      });
    }

    if (livreResult.rows[0].statut !== 'disponible') {
      await client.query('ROLLBACK');

      return res.status(409).json({
        success: false,
        message: 'Ce livre est déjà emprunté',
      });
    }

    // 3. Vérifier la date de retour prévue
    const dateValidation = await client.query(
      `
        SELECT
          $1::date >= CURRENT_DATE AS valide
      `,
      [date_retour_prevue]
    );

    if (!dateValidation.rows[0].valide) {
      await client.query('ROLLBACK');

      return res.status(422).json({
        success: false,
        message:
          'La date de retour prévue ne peut pas être antérieure à la date actuelle',
      });
    }

    // 4. Créer l'emprunt
    const empruntResult = await client.query(
      `
        INSERT INTO emprunts (
          membre_id,
          livre_id,
          date_retour_prevue
        )
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [
        membre_id,
        livre_id,
        date_retour_prevue,
      ]
    );

    await client.query('COMMIT');

    // 5. Récupérer l'emprunt complet
    const result = await pool.query(
      `
        ${empruntSelect}
        WHERE e.id = $1
      `,
      [empruntResult.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: 'Emprunt créé avec succès',
      data: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');

    // Emprunt actif déjà existant pour le même livre
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ce livre possède déjà un emprunt en cours',
      });
    }

    // Violation d'une contrainte CHECK PostgreSQL
    if (error.code === '23514') {
      return res.status(422).json({
        success: false,
        message:
          'Les données de l’emprunt ne respectent pas les règles métier',
      });
    }

    next(error);
  } finally {
    client.release();
  }
};

const updateEmprunt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date_retour_prevue } = req.body;

    const result = await pool.query(
      `
        UPDATE emprunts
        SET
          date_retour_prevue = $1
        WHERE id = $2
          AND statut = 'en_cours'
        RETURNING id
      `,
      [date_retour_prevue, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emprunt en cours introuvable',
      });
    }

    const emprunt = await pool.query(
      `
        ${empruntSelect}
        WHERE e.id = $1
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Emprunt modifié avec succès',
      data: emprunt.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const returnEmprunt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        UPDATE emprunts
        SET
          statut = 'retourne',
          date_retour_effective = CURRENT_DATE
        WHERE id = $1
          AND statut = 'en_cours'
        RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emprunt en cours introuvable',
      });
    }

    const emprunt = await pool.query(
      `
        ${empruntSelect}
        WHERE e.id = $1
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Livre retourné avec succès',
      data: emprunt.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmprunts,
  getEmpruntById,
  createEmprunt,
  updateEmprunt,
  returnEmprunt,
};