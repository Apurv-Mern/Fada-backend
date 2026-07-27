const {
    sequelize,
  Dealer,
  DealerLocation,
  KeyContact,
  DealerProfile,
} = require("../../../database/models");
const Validator = require("validatorjs");

const getDealerId = (req) => req.auth.id;

/*
@API: GET /dealer/contact-persons
@Desc: Get dealer contact persons
@Access: Private     
*/
exports.getContactPersons = async (req, res) => {
    try {
        const dealerId = getDealerId(req);
        const contactPersons = await KeyContact.findAll({ 
            attributes: ["id", "name", "email", "phone","designation","isActive"],
            where: { dealerId } 
        });
        return res.apiSuccess("Contact persons fetched successfully", contactPersons);
    } catch (error) {
        return res.apiError(error.message, 500, error);
    }
};

/*
@API: POST /dealer/contact-persons
@Desc: Create dealer contact person
@Body: {
    name: string,
    email: string,
    phone: string,
    designation: string
}
@Access: Private     
*/
exports.createContactPerson = async (req, res) => {
    try {
        const dealerId = getDealerId(req);

        const validator = new Validator(req.body, {
            name: "required|string",
            email: "required|email",
            phone: "required|string",
            designation: "required|string",
        });

        if (validator.fails()) {
            return res.apiError(validator.errors.all(), 400);   
        }
        await KeyContact.create({ dealerId, isActive: true, ...req.body });
        return res.apiSuccess("Contact person created successfully");
    } catch (error) {
        return res.apiError(error.message, 500, error);
    }
};

/*
@API: PUT /dealer/contact-persons/:id
@Desc: Update dealer contact person
@Body: {
    name: string,
    email: "required|email",
    phone: "required|string",
    designation: "required|string",
}
@Access: Private     
*/
exports.updateContactPerson = async (req, res) => {
    try {
        const dealerId = getDealerId(req);

        const validator = new Validator(req.body, {
            name: "required|string",
            email: "required|email",
            phone: "required|string",
            designation: "required|string",
            isActive: "required|boolean",
        });

        if (validator.fails()) {
            return res.apiError(validator.errors.all(), 400);   
        }

        await KeyContact.update({ ...req.body }, { where: { id: req.params.id, dealerId } });
        return res.apiSuccess("Contact person updated successfully");
    } catch (error) {
        return res.apiError(error.message, 500, error);
    }
};

/*
@API: DELETE /dealer/contact-persons/:id
@Desc: Delete dealer contact person
@Access: Private     
*/
exports.deleteContactPerson = async (req, res) => {
    try {
        const dealerId = getDealerId(req);
        await KeyContact.destroy({ where: { id: req.params.id, dealerId } });
        return res.apiSuccess("Contact person deleted successfully");
    } catch (error) {
        return res.apiError(error.message, 500, error);
    }
};



/*
@API: PUT /dealer/contact-persons/:id/status
@Desc: Update dealer contact person status
@Body: {
    isActive: boolean (true or false)
}
@Access: Private     
*/
exports.updateContactPersonStatus = async (req, res) => {
    try {
        const dealerId = getDealerId(req);
        await KeyContact.update(
            { isActive: req.body.isActive },
            { where: { id: req.params.id, dealerId } },
        );
        return res.apiSuccess("Contact person status updated successfully");
    } catch (error) {
        return res.apiError(error.message, 500, error);
    }
};