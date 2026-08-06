const Validator = require("validatorjs");
const { EmployeeCertificate } = require("../../../../database/models");

/*
@API: GET /employee/certificates
@Desc: Get employee certificates
@Access: Private
*/

exports.getCertificates = async (req, res) => {
  try {
    const certificates = await EmployeeCertificate.findAll({where: {employeeId: req.auth.id}});
    return res.apiSuccess("Employee certificates fetched successfully", certificates);
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: GET /employee/certificates/{certificateId}
@Desc: Get employee certificate
@Access: Private
*/
exports.getCertificate = async (req, res) => {
  try {
    const certificate = await EmployeeCertificate.findByPk(req.params.certificateId);
    return res.apiSuccess("Employee certificate fetched successfully", certificate);
  } catch (error) {

    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: POST /employee/certificates
@Desc: Create employee certificate
@Body: {
  certificateName: string,
  issuingAuthority: string,
  issueDate: date,
  certificateNumber: string,
  description: string,
  attachment: string,
}
@Access: Private
*/
exports.createCertificate = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      certificateName: "required|string",
      issuingAuthority: "required|string",
      issueDate: "required|date",
      certificateNumber: "required|string",
      description: "string",
      attachment: "required|string",
    });
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }
     await EmployeeCertificate.create({...req.body, employeeId: req.auth.id});
    return res.apiSuccess("Employee certificate created successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: PUT /employee/certificates/{certificateId}
@Desc: Update employee certificate
@Body: {
  certificateName: string,
  issuingAuthority: string,
  issueDate: date,
  certificateNumber: string,
  description: string,
  attachment: string,
}
@Access: Private
*/
exports.updateCertificate = async (req, res) => {
  try {
    const validator = new Validator(req.body, {
      certificateName: "required|string",
      issuingAuthority: "required|string",
      issueDate: "required|date",
      certificateNumber: "required|string",
      description: "string",
      attachment: "required|string",
    });
    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }
    await EmployeeCertificate.update(req.body, {where: {id: req.params.certificateId}});
    return res.apiSuccess("Employee certificate updated successfully");
  } catch (error) {
    return res.apiError("Internal server error", 500, error);
  }
};

/*
@API: DELETE /employee/certificates/{certificateId}
@Desc: Delete employee certificate
@Access: Private
*/
exports.deleteCertificate = async (req, res) => {
    try {
        await EmployeeCertificate.destroy({where: {id: req.params.certificateId}});
        return res.apiSuccess("Employee certificate deleted successfully");
    } catch (error) {
        return res.apiError("Internal server error", 500, error);
    }
};
