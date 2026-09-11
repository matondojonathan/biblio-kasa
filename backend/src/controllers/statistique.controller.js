const pool = require('../config/database');

const getStatistiques = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM livres) AS total_livres,

        (SELECT COUNT(*)
         FROM livres
         WHERE statut = 'disponible') AS livres_disponibles,

        (SELECT COUNT(*)
         FROM livres
         WHERE statut = 'emprunte') AS livres_empruntes,

        (SELECT COUNT(*) FROM membres) AS total_membres,

        (SELECT COUNT(*)
         FROM membres
         WHERE actif = true) AS membres_actifs,

        (SELECT COUNT(*)
         FROM membres
         WHERE actif = false) AS membres_inactifs,

        (SELECT COUNT(*)
         FROM emprunts
         WHERE statut = 'en_cours') AS emprunts_en_cours,

        (SELECT COUNT(*)
         FROM emprunts
         WHERE statut = 'retourne') AS emprunts_retournes,

        (SELECT COUNT(*)
         FROM emprunts
         WHERE statut = 'en_cours'
           AND date_retour_prevue < CURRENT_DATE) AS emprunts_en_retard,

        (SELECT COUNT(*) FROM auteurs) AS total_auteurs
    `);

    const statistiques = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        livres: {
          total: Number(statistiques.total_livres),
          disponibles: Number(statistiques.livres_disponibles),
          empruntes: Number(statistiques.livres_empruntes),
        },

        membres: {
          total: Number(statistiques.total_membres),
          actifs: Number(statistiques.membres_actifs),
          inactifs: Number(statistiques.membres_inactifs),
        },

        emprunts: {
          en_cours: Number(statistiques.emprunts_en_cours),
          retournes: Number(statistiques.emprunts_retournes),
          en_retard: Number(statistiques.emprunts_en_retard),
        },

        auteurs: {
          total: Number(statistiques.total_auteurs),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStatistiques,
};