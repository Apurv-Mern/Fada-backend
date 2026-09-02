const { generateUniqueDealerPublicCode } = require("./entityCodeUtil");

const FADA_ALPHABET = "ABCDEFGHJKMNPRTUVWXY";
const FADA_DIGITS = "0123456789";

function generateRandomString(characters, length) {
  let result = "";

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * characters.length);
    result += characters[index];
  }

  return result;
}

function makeFadaId() {
  const letters = generateRandomString(FADA_ALPHABET, 2);
  const digits = generateRandomString(FADA_DIGITS, 5);

  return `FADA-${letters}-${digits}`;
}

const generateFadaId = async (Employee) => {
  const fadaId = makeFadaId();

  const existing = await Employee.findOne({
    where: { fadaId },
    paranoid: false,
  });

  if (existing) {
    return generateFadaId(Employee);
  }

  return fadaId;
};

const generateDealerId = async (Dealer, options = {}) =>
  generateUniqueDealerPublicCode(Dealer, options);

module.exports = {
  generateFadaId,
  generateDealerId,
};
