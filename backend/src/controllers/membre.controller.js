const pool = require('../config/database');

const getAllMembres = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        nom,
        prenom,
        email,
        telephone,
        date_inscription,
        actif,
        date_creation,
        date_modification
      FROM membres
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

const getMembreById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        SELECT
          id,
          nom,
          prenom,
          email,
          telephone,
          date_inscription,
          actif,
          date_creation,
          date_modification
        FROM membres
        WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Membre introuvable',
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

const createMembre = async (req, res, next) => {
  try {
    const {
      nom,
      prenom,
      email,
      telephone,
      actif = true,
    } = req.body;

    const result = await pool.query(
      `
        INSERT INTO membres (
          nom,
          prenom,
          email,
          telephone,
          actif
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          nom,
          prenom,
          email,
          telephone,
          date_inscription,
          actif,
          date_creation,
          date_modification
      `,
      [
        nom,
        prenom,
        email || null,
        telephone || null,
        actif,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Membre créé avec succès',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée',
      });
    }

    next(error);
  }
};

const updateMembre = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nom,
      prenom,
      email,
      telephone,
      actif,
    } = req.body;

    const result = await pool.query(
      `
        UPDATE membres
        SET
          nom = $1,
          prenom = $2,
          email = $3,
          telephone = $4,
          actif = $5
        WHERE id = $6
        RETURNING
          id,
          nom,
          prenom,
          email,
          telephone,
          date_inscription,
          actif,
          date_creation,
          date_modification
      `,
      [
        nom,
        prenom,
        email || null,
        telephone || null,
        actif,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Membre introuvable',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Membre modifié avec succès',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée',
      });
    }

    next(error);
  }
};

const deleteMembre = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM membres WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Membre introuvable',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Membre supprimé avec succès',
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'Impossible de supprimer ce membre car des emprunts lui sont associés',
      });
    }

    next(error);
  }
};

module.exports = {
  getAllMembres,
  getMembreById,
  createMembre,
  updateMembre,
  deleteMembre,
};