const { Op } = require("sequelize");

const generateFadaId = async (Employee) => {
  const year = new Date().getFullYear();
  const prefix = `FADA-${year}-`;

  const lastEmployee = await Employee.findOne({
    where: {
      fadaId: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [["fadaId", "DESC"]],
    paranoid: false,
  });

  let nextSequence = 1;

  if (lastEmployee?.fadaId) {
    const sequencePart = lastEmployee.fadaId.split("-")[2];
    const lastSequence = parseInt(sequencePart, 10);

    if (!Number.isNaN(lastSequence)) {
      nextSequence = lastSequence + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(6, "0")}`;
};

module.exports = {
  generateFadaId,
};
