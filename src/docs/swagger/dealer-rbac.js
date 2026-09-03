/**
 * @swagger
 * tags:
 *   - name: Dealer Portal RBAC
 *     description: >
 *       Dealer portal role and permission management under Settings.
 *       Primary dealer accounts have implicit access; staff require dealer_settings.manage.
 *       Role create/update/delete is restricted to primary dealer accounts (userType=dealer).
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DealerRoleItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         key:
 *           type: string
 *           example: dealer_manager
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         assignableTo:
 *           type: string
 *           enum: [dealer]
 *         isSystem:
 *           type: boolean
 *         isSuperRole:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           example: [dealer_dashboard.view, dealer_outlets.manage]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     DealerRoleCreateRequest:
 *       type: object
 *       required: [key, name, permissions]
 *       properties:
 *         key:
 *           type: string
 *           example: dealer_sales_lead
 *         name:
 *           type: string
 *           example: Sales Lead
 *         description:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: Dealer portal permission keys only (dealer_* prefix)
 *         isActive:
 *           type: boolean
 *           default: true
 *     DealerRoleUpdateRequest:
 *       type: object
 *       required: [name, permissions]
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *         isActive:
 *           type: boolean
 *     DealerRoleListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiSuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DealerRoleItem'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *   examples:
 *     DealerPortalModuleCatalog:
 *       summary: Dealer portal sidebar modules and permissions
 *       value:
 *         - key: dealer_dashboard
 *           name: Dashboard
 *           sortOrder: 101
 *           permissions:
 *             - key: dealer_dashboard.view
 *               name: View dashboard
 *               action: view
 *         - key: dealer_company_profile
 *           name: Company Profile
 *           sortOrder: 102
 *           permissions:
 *             - key: dealer_company_profile.view
 *               name: View company profile
 *               action: view
 *             - key: dealer_company_profile.edit
 *               name: Edit company profile
 *               action: edit
 *         - key: dealer_outlets
 *           name: Outlets
 *           sortOrder: 103
 *           permissions:
 *             - key: dealer_outlets.view
 *               name: View outlets
 *               action: view
 *             - key: dealer_outlets.manage
 *               name: Manage outlets
 *               action: manage
 *         - key: dealer_employees
 *           name: Employees
 *           sortOrder: 104
 *           permissions:
 *             - key: dealer_employees.view
 *               name: View employees
 *               action: view
 *             - key: dealer_employees.manage
 *               name: Manage employees
 *               action: manage
 *         - key: dealer_employment_requests
 *           name: Employment Requests
 *           sortOrder: 105
 *           permissions:
 *             - key: dealer_employment_requests.view
 *               name: View employment requests
 *               action: view
 *             - key: dealer_employment_requests.manage
 *               name: Manage employment requests
 *               action: manage
 *         - key: dealer_reports
 *           name: Reports
 *           sortOrder: 106
 *           permissions:
 *             - key: dealer_reports.view
 *               name: View reports
 *               action: view
 *             - key: dealer_reports.export
 *               name: Export reports
 *               action: export
 *         - key: dealer_communications
 *           name: Communications
 *           sortOrder: 107
 *           permissions:
 *             - key: dealer_communications.view
 *               name: View communications
 *               action: view
 *         - key: dealer_settings
 *           name: Settings
 *           sortOrder: 108
 *           permissions:
 *             - key: dealer_settings.manage
 *               name: Manage settings
 *               action: manage
 *             - key: dealer_staff.view
 *               name: View staff members
 *               action: view
 *             - key: dealer_staff.create
 *               name: Create staff members
 *               action: create
 *             - key: dealer_staff.edit
 *               name: Edit staff members
 *               action: edit
 *             - key: dealer_staff.delete
 *               name: Delete staff members
 *               action: delete
 *     DealerPortalDefaultRoles:
 *       summary: Seeded dealer portal roles
 *       value:
 *         - key: dealer_admin
 *           name: Dealer Admin
 *           isSuperRole: true
 *           description: Full access to every dealer portal module
 *         - key: dealer_manager
 *           name: Dealer Manager
 *           isSuperRole: false
 *           description: Manage outlets, employees, employment requests, and reports; view-only staff
 *         - key: dealer_viewer
 *           name: Dealer Viewer
 *           isSuperRole: false
 *           description: Read-only access across all modules
 */

/**
 * @swagger
 * /dealers/modules:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Portal RBAC]
 *     summary: List dealer portal modules with permissions
 *     description: Returns the RBAC matrix for the dealer portal Settings screen.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Modules fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DealerPortalModule'
 *       403:
 *         description: Missing dealer_settings.manage permission
 */

/**
 * @swagger
 * /dealers/permissions:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Portal RBAC]
 *     summary: List flat dealer portal permissions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DealerPortalPermission'
 *       403:
 *         description: Missing dealer_settings.manage permission
 */

/**
 * @swagger
 * /dealers/roles:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Portal RBAC]
 *     summary: List dealer portal roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Roles fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DealerRoleListResponse'
 *       403:
 *         description: Missing dealer_settings.manage permission
 *   post:
 *     tags: [Dealer Portal RBAC]
 *     summary: Create custom dealer portal role
 *     description: Primary dealer account only. Permissions must be dealer portal keys (dealer_*).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerRoleCreateRequest'
 *     responses:
 *       200:
 *         description: Role created successfully
 *       403:
 *         description: Staff accounts cannot manage roles
 *       409:
 *         description: Role key already exists
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /dealers/roles/{id}:
 *   parameters:
 *     - $ref: '#/components/parameters/XDealerId'
 *   get:
 *     tags: [Dealer Portal RBAC]
 *     summary: Get dealer portal role by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DealerRoleItem'
 *       404:
 *         description: Role not found
 *   put:
 *     tags: [Dealer Portal RBAC]
 *     summary: Update dealer portal role and permissions
 *     description: >
 *       Replaces permission assignments. Super roles (dealer_admin) ignore permission updates.
 *       Primary dealer account only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerRoleUpdateRequest'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       403:
 *         description: Staff accounts cannot manage roles
 *       404:
 *         description: Role not found
 *       422:
 *         description: Validation error
 *   delete:
 *     tags: [Dealer Portal RBAC]
 *     summary: Delete custom dealer portal role
 *     description: System roles cannot be deleted. Primary dealer account only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: System role or role assigned to staff
 *       403:
 *         description: Staff accounts cannot manage roles
 *       404:
 *         description: Role not found
 */
