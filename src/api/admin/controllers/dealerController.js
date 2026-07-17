const {Dealer} = require('../../../database/models');
const Validator = require('validatorjs');
/*
@API: GET /admin/dealers
@Desc: Get all dealers
@Access: Private     
*/
exports.getDealers = async (req, res) => {
    try {
        const dealers = await Dealer.findAll();
        return res.apiSuccess("Dealers fetched successfully", dealers);
    } catch (error) {
        return res.apiError(error.message, 500, error);
    }
};

/*
@API: GET /admin/dealers/:id
@Desc: Get a dealer by id
@Access: Private     
*/
exports.getDealerById = async (req, res) => {
    try {
        const dealer = await Dealer.findByPk(req.params.id);
        return res.apiSuccess("Dealer fetched successfully", dealer);
    } catch (error) {
        return res.apiError(error.message, 500, error);
    }
};

/*
@API: POST /admin/dealers
@Desc: Create a dealer
@Access: Private     
*/
exports.createDealer = async (req, res) => {
    try {
        const validator = new Validator(req.body, {
            name: 'required|string',
            email: 'required|email',
            phone: 'required|string',
            address: 'required|string',
        });
        if (validator.fails()) {
            return res.apiError(validator.errors.all(), 400);
        }
            
        const dealer = await Dealer.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
        });
        return res.apiSuccess("Dealer created successfully", dealer);
    } catch (error) {
        return res.apiError(error.message, 500, error);
    }
};

/*
@API: PUT /admin/dealers/:id
@Desc: Update a dealer
@Access: Private     
*/
exports.updateDealer = async (req, res) => {
    try {
        const validator = new Validator(req.body, {
            name: 'required|string',
            email: 'required|email',
            phone: 'required|string',
            address: 'required|string',
        });
        if (validator.fails()) {
            return res.apiError(validator.errors.all(), 400);
        }
        const dealer = await Dealer.update({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
        }, {
            where: { id: req.params.id }
        });
        return res.apiSuccess("Dealer updated successfully", dealer);
    } catch (error) {
        return res.apiError(error.message, 500, error);
    }
};

/*
@API: DELETE /admin/dealers/:id
@Desc: Delete a dealer
@Access: Private     
*/
exports.deleteDealer = async (req, res) => {
    try {
        await Dealer.destroy({
            where: { id: req.params.id }
        });
        return res.apiSuccess("Dealer deleted successfully");
    } catch (error) {
        return res.apiError(error.message, 500, error);
    }
};

/*
@API: PUT /admin/dealers/:id/status
@Desc: Update a dealer status
@Access: Private     
*/
exports.updateDealerStatus = async (req, res) => {
    try {
        const validator = new Validator(req.body, {
            status: 'required|string', 
        });
        if (validator.fails()) {
            return res.apiError(validator.errors.all(), 400);
        }
        const dealer = await Dealer.update({
            status: req.body.status,
        }, {
            where: { id: req.params.id }
        });
        return res.apiSuccess("Dealer status updated successfully", dealer);
    } catch (error) {
        return res.apiError(error.message, 500, error);
    }
};