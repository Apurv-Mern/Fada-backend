const Validator = require("validatorjs");
const { EmployeeEmergencyContact } = require("../../../../database/models");

const emergencyContactValidationRules = {
  name: "required|string",
  phone: "string",
  relation: "string",
  isActive: "boolean",
};

async function findOwnedEmergencyContact(contactId, employeeId) {
  return EmployeeEmergencyContact.findOne({
    where: { id: contactId, employeeId },
  });
}

exports.getEmergencyContacts = async (req, res) => {
  try {
    const contacts = await EmployeeEmergencyContact.findAll({
      where: { employeeId: req.auth.id },
      order: [["id", "DESC"]],
    });
    return res.apiSuccess(
      "Emergency contacts fetched successfully",
      contacts,
    );
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

exports.getEmergencyContact = async (req, res) => {
  try {
    const contact = await findOwnedEmergencyContact(
      req.params.emergencyContactId,
      req.auth.id,
    );
    if (!contact) {
      return res.apiError("Emergency contact not found", 404);
    }
    return res.apiSuccess("Emergency contact fetched successfully", contact);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

exports.createEmergencyContact = async (req, res) => {
  try {
    const validator = new Validator(req.body, emergencyContactValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { name, phone, relation, isActive } = req.body;

    await EmployeeEmergencyContact.create({
      employeeId: req.auth.id,
      name: name.trim(),
      phone: phone ?? null,
      relation: relation ?? null,
      isActive: isActive ?? true,
    });

    return res.apiSuccess("Emergency contact created successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

exports.updateEmergencyContact = async (req, res) => {
  try {
    const contact = await findOwnedEmergencyContact(
      req.params.emergencyContactId,
      req.auth.id,
    );
    if (!contact) {
      return res.apiError("Emergency contact not found", 404);
    }

    const validator = new Validator(req.body, emergencyContactValidationRules);
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const { name, phone, relation, isActive } = req.body;

    await contact.update({
      name: name.trim(),
      phone: phone ?? null,
      relation: relation ?? null,
      isActive: isActive ?? contact.isActive,
    });

    return res.apiSuccess("Emergency contact updated successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

exports.deleteEmergencyContact = async (req, res) => {
  try {
    const contact = await findOwnedEmergencyContact(
      req.params.emergencyContactId,
      req.auth.id,
    );
    if (!contact) {
      return res.apiError("Emergency contact not found", 404);
    }

    await contact.destroy();

    return res.apiSuccess("Emergency contact deleted successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};
