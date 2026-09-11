const pool = require('../config/database');

const livreSelect = `
  SELECT
    l.id,
    l.titre,
    l.auteur_id,
    a.nom AS auteur_nom,
    a.prenom AS auteur_prenom,
    l.annee_publication,
    l.isbn,
    l.statut,
    l.date_creation,
    l.date_modification
  FROM livres l
  INNER JOIN auteurs a ON a.id = l.auteur_id
`;

const getAllLivres = async (req, res, next) => {
  try {
    const result = await pool.query(`
      ${livreSelect}
      ORDER BY l.titre ASC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

const getLivreById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        ${livreSelect}
        WHERE l.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Livre introuvable',
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

const createLivre = async (req, res, next) => {
  try {
    const {
      titre,
      auteur_id,
      annee_publication,
      isbn,
    } = req.body;

    const result = await pool.query(
      `
        INSERT INTO livres (
          titre,
          auteur_id,
          annee_publication,
          isbn
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      [
        titre,
        auteur_id,
        annee_publication || null,
        isbn || null,
      ]
    );

    const livre = await pool.query(
      `
        ${livreSelect}
        WHERE l.id = $1
      `,
      [result.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: 'Livre créé avec succès',
      data: livre.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'L’auteur indiqué n’existe pas',
      });
    }

    next(error);
  }
};

const updateLivre = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      titre,
      auteur_id,
      annee_publication,
      isbn,
    } = req.body;

    const result = await pool.query(
      `
        UPDATE livres
        SET
          titre = $1,
          auteur_id = $2,
          annee_publication = $3,
          isbn = $4
        WHERE id = $5
        RETURNING id
      `,
      [
        titre,
        auteur_id,
        annee_publication || null,
        isbn || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Livre introuvable',
      });
    }

    const livre = await pool.query(
      `
        ${livreSelect}
        WHERE l.id = $1
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Livre modifié avec succès',
      data: livre.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'L’auteur indiqué n’existe pas',
      });
    }

    next(error);
  }
};

const deleteLivre = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM livres WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Livre introuvable',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Livre supprimé avec succès',
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'Impossible de supprimer ce livre car il possède des emprunts',
      });
    }

    next(error);
  }
};

module.exports = {
  getAllLivres,
  getLivreById,
  createLivre,
  updateLivre,
  deleteLivre,
};