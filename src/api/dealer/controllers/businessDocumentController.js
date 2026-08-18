const { Op } = require("sequelize");
const {
  sequelize,
  Document,
  DealerDocument,
} = require("../../../database/models");
const Validator = require("validatorjs");

const getDealerId = (req) => req.currentDealerId;

const formatBusinessDocuments = (documents = []) =>
  documents.map((document) => {
    const data = document.get ? document.get({ plain: true }) : document;
    const upload = data.dealerDocuments;

    return {
      id: data.id,
      name: data.name,
      category: data.category,
      notes: data.notes,
      isMandatory: data.isMandatory,
      isVerificationRequired: data.isVerificationRequired,
      isUploaded: Boolean(upload),
      upload: upload
        ? {
          id: upload.id,
          documentUrl: upload.documentUrl,
          status: upload.status,
          isVerified: upload.isVerified,
          uploadedAt: upload.createdAt,
          updatedAt: upload.updatedAt,
        }
        : null,
    };
  });

/*
@API: GET /dealers/business-documents
@Desc: Get dealer business documents
@Access: Private
*/
exports.getBusinessDocuments = async (req, res) => {
  try {
    const dealerId = getDealerId(req);
    const documents = await Document.findAll({
      where: { isActive: true, appliesTo: { [Op.in]: ["dealer", "both"] } },
      attributes: [
        "id",
        "name",
        "category",
        "notes",
        "isMandatory",
        "isVerificationRequired",
      ],
      include: [
        {
          model: DealerDocument,
          as: "dealerDocuments",
          required: false,
          where: { dealerId },
          attributes: [
            "id",
            "documentUrl",
            "isVerified",
            "status",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
      order: [
        ["sortOrder", "ASC"],
        ["name", "ASC"],
      ],
    });

    return res.apiSuccess(
      "Business documents fetched successfully",
      formatBusinessDocuments(documents),
    );
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: POST /dealers/business-documents
@Desc: Upload dealer business document
@Access: Private
*/
exports.uploadBusinessDocument = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const dealerId = getDealerId(req);

    const validator = new Validator(req.body, {
      documentUrl: "required|string",
      documentId: "required|integer",
    });

    if (validator.fails()) {
      await transaction.rollback();
      return res.apiError(
        Object.values(validator.errors.all()).flat()[0],
        422
      );
    }

    const { documentId, documentUrl } = req.body;

    // Check document type
    const document = await Document.findOne({
      where: { id: documentId, isActive: true },
      transaction,
    });

    if (!document) {
      await transaction.rollback();
      return res.apiError("Document type not found", 404);
    }

    // Remove previous document for this dealer and document type
    await DealerDocument.destroy({
      where: { dealerId, documentId },
      transaction,
    });

    // Create new document
    const dealerDocument = await DealerDocument.create(
      {
        dealerId,
        documentId,
        documentUrl,
        isVerified: false,
        status: "pending",
      },
      { transaction }
    );

    await transaction.commit();

    return res.apiSuccess("Business document uploaded successfully", dealerDocument);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.apiError(
        "Document already uploaded for this type",
        409
      );
    }

    return res.apiError(error.message, 500, error);
  }
};

/*
@API: DELETE /dealers/business-documents/:id
@Desc: Delete dealer business document
@Access: Private
*/
exports.deleteBusinessDocument = async (req, res) => {
  try {
    const dealerId = getDealerId(req);
    const deleted = await DealerDocument.destroy({
      where: { id: req.params.id, dealerId },
    });

    if (!deleted) {
      return res.apiError("Business document not found", 404);
    }

    return res.apiSuccess("Business document deleted successfully");
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};
