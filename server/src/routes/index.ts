import express from 'express';
import customerRoutes from './customer.routes';
import vehicleRoutes from './vehicle.routes';
import workOrderRoutes from './workOrder.routes';
import technicianRoutes from './technician.routes';
import dashboardRoutes from './dashboard.routes';

const router = express.Router();

router.use('/customers', customerRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/workorders', workOrderRoutes);
router.use('/technicians', technicianRoutes);
router.use('/dashboard', dashboardRoutes);

export default router; 