const authRoutes = require("./../api/auth/routes");
const apiReponser = require("./../middlewares/apiResponder");
const adminRoutes = require("./../api/admin/routes");
module.exports = (app) => {
  //This middleware is used for send-api-response
  app.use(apiReponser);

  // auth routes
  app.use(authRoutes);

  // Routes for Web-application
  app.use("/admin", adminRoutes);

  // Routes for Web-application
  //app.use("/dealers", dealerRoutes);

  //Version 1 routes for Mobile-application
  //app.use("/api/v1", apiV1Routes);

  return app;
};
