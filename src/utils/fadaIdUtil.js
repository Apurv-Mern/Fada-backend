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

function makeDealerId() {
  const letters = generateRandomString(FADA_ALPHABET, 2);
  const digits = generateRandomString(FADA_DIGITS, 5);

  return `DLR-${letters}-${digits}`;
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

const generateDealerId = async (Dealer) => {
  const dealerId = makeDealerId();

  const existing = await Dealer.findOne({
    where: { dealerId },
    paranoid: false,
  });

  if (existing) {
    return generateDealerId(Dealer);
  }

  return dealerId;
};

module.exports = {
  generateFadaId,
  generateDealerId,
};
