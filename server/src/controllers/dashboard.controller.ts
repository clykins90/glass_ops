import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to convert BigInt to Number
const convertBigIntToNumber = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'bigint') {
    return Number(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertBigIntToNumber(item));
  }
  
  if (typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      result[key] = convertBigIntToNumber(data[key]);
    }
    return result;
  }
  
  return data;
};

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    // Get total customers count
    const totalCustomers = await prisma.customer.count();
    
    // Get active work orders count (not completed or cancelled)
    const activeWorkOrders = await prisma.workOrder.count({
      where: {
        status: {
          notIn: ['completed', 'cancelled']
        }
      }
    });
    
    // Get work orders scheduled for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const scheduledToday = await prisma.workOrder.count({
      where: {
        scheduledDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    // Get recent work orders (last 5)
    const recentWorkOrders = await prisma.workOrder.findMany({
      take: 5,
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        customer: true,
        vehicle: true,
        technician: true
      }
    });
    
    // Get work orders by status for chart
    const workOrdersByStatusRaw = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count 
      FROM "WorkOrder" 
      GROUP BY status
    `;
    
    // Convert BigInt to Number
    const workOrdersByStatus = convertBigIntToNumber(workOrdersByStatusRaw);
    
    // Get work orders by service type for chart
    const workOrdersByServiceTypeRaw = await prisma.$queryRaw`
      SELECT "serviceType", COUNT(*) as count 
      FROM "WorkOrder" 
      GROUP BY "serviceType"
    `;
    
    // Convert BigInt to Number
    const workOrdersByServiceType = convertBigIntToNumber(workOrdersByServiceTypeRaw);
    
    // Get technician workload (work orders assigned to each technician)
    const technicianWorkload = await prisma.technician.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        _count: {
          select: {
            workOrders: {
              where: {
                status: {
                  notIn: ['completed', 'cancelled']
                }
              }
            }
          }
        }
      }
    });
    
    res.json({
      totalCustomers,
      activeWorkOrders,
      scheduledToday,
      recentWorkOrders,
      workOrdersByStatus,
      workOrdersByServiceType,
      technicianWorkload
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
}; 