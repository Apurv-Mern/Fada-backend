const authRoutes = require("./../api/auth/routes");
const apiReponser = require("./../middlewares/apiResponder");
const adminRoutes = require("./../api/admin/routes");
const dealerRoutes = require("./../api/dealer/routes");
const employeeRoutes = require("./../api/app/v1/routes");
module.exports = (app) => {
  //This middleware is used for send-api-response
  app.use(apiReponser);

  // auth routes
  app.use(authRoutes);

  // Routes for Web-application
  app.use("/admin", adminRoutes);

  // Routes for Web-application
  app.use("/dealers", dealerRoutes);

  //Version 1 routes for Mobile-application
  app.use("/api/v1/employee", employeeRoutes);

  return app;
};
