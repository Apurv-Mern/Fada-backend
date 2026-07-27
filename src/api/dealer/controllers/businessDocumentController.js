const {
    sequelize,
  Dealer,
  DealerLocation,
  KeyContact,
  DealerProfile,
  Document
} = require("../../../database/models");
const Validator = require("validatorjs")

/*
@API: GET /dealer/business-documents
@Desc: Get dealer business documents
@Access: Private     
*/
exports.getBusinessDocuments = async (req, res) => {
    try {
        const { id } = req.auth.id;
        const businessDocuments = await Document.findAll({ where: {isActive: true, appliesTo: {[Op.in]: ["dealer","both"]}} });
        return res.apiSuccess("Business documents fetched successfully", businessDocuments);
    } catch (error) {
        return res.apiError(error.message, 500, error);
    }
};