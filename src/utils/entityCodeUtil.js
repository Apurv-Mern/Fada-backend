const FIRST_DIGIT = "123456789";
const OTHER_DIGITS = "0123456789";
const MAX_RETRIES = 20;

function randomChar(characters) {
  return characters[Math.floor(Math.random() * characters.length)];
}

function randomDigits(length) {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += randomChar(OTHER_DIGITS);
  }
  return result;
}

function makeDealerPublicCode() {
  return `DL${randomChar(FIRST_DIGIT)}${randomDigits(4)}`;
}

function makeOutletPublicCode() {
  return `OT${randomChar(FIRST_DIGIT)}${randomDigits(5)}`;
}

async function generateUniqueCode(Model, field, makeCode, options = {}) {
  const { transaction } = options;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const code = makeCode();
    const existing = await Model.findOne({
      where: { [field]: code },
      paranoid: false,
      transaction,
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error(`Unable to generate unique ${field} after ${MAX_RETRIES} attempts`);
}

async function generateUniqueDealerPublicCode(Dealer, options = {}) {
  return generateUniqueCode(Dealer, "dealerId", makeDealerPublicCode, options);
}

async function generateUniqueOutletPublicCode(Outlet, options = {}) {
  return generateUniqueCode(Outlet, "code", makeOutletPublicCode, options);
}

module.exports = {
  makeDealerPublicCode,
  makeOutletPublicCode,
  generateUniqueDealerPublicCode,
  generateUniqueOutletPublicCode,
};
