const pool = require('../config/database');

const getAllAuteurs = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        nom,
        prenom,
        date_creation,
        date_modification
      FROM auteurs
      ORDER BY nom ASC, prenom ASC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

const getAuteurById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        SELECT
          id,
          nom,
          prenom,
          date_creation,
          date_modification
        FROM auteurs
        WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Auteur introuvable',
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

const createAuteur = async (req, res, next) => {
  try {
    const { nom, prenom } = req.body;

    const result = await pool.query(
      `
        INSERT INTO auteurs (nom, prenom)
        VALUES ($1, $2)
        RETURNING
          id,
          nom,
          prenom,
          date_creation,
          date_modification
      `,
      [nom.trim(), prenom?.trim() || null]
    );

    res.status(201).json({
      success: true,
      message: 'Auteur créé avec succès',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const updateAuteur = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, prenom } = req.body;

    const result = await pool.query(
      `
        UPDATE auteurs
        SET
          nom = $1,
          prenom = $2
        WHERE id = $3
        RETURNING
          id,
          nom,
          prenom,
          date_creation,
          date_modification
      `,
      [nom.trim(), prenom?.trim() || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Auteur introuvable',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Auteur modifié avec succès',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const deleteAuteur = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM auteurs WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Auteur introuvable',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Auteur supprimé avec succès',
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'Impossible de supprimer cet auteur car des livres lui sont associés',
      });
    }

    next(error);
  }
};

module.exports = {
  getAllAuteurs,
  getAuteurById,
  createAuteur,
  updateAuteur,
  deleteAuteur,
};
