import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Bill from '../models/Bill';
import Payment from '../models/Payment';
import PaymentAudit from '../models/PaymentAudit';
import { round2 } from '../utils/billing';

export async function recordPaymentDualBilling(req: Request, res: Response) {
  try {
    const { entityType, entityId, amount, date, method, reference, notes, billId, processedBy } = req.body;
    
    if (!entityType || !entityId || !amount || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'entityType, entityId, amount, date are required' 
      });
    }

    // Company payment validation - no partial payments allowed
    if (entityType === 'company') {
      if (billId) {
        const targetBill = await Bill.findById(billId);
        if (targetBill && Math.abs(Number(amount) - targetBill.balanceAmount) > 0.01) {
          return res.status(400).json({
            success: false,
            message: 'Company payments must be full payment only. No partial payments allowed.'
          });
        }
      }
    }

    const payment = new Payment({ 
      entityType, 
      entityId, 
      amount, 
      date, 
      method, 
      reference, 
      notes, 
      allocations: [] 
    });

    let remaining = Number(amount);
    const auditEntries: any[] = [];

    // Get target bills for allocation
    const targetBills = billId ?
      await Bill.find({ _id: billId }) :
      await Bill.find({ 
        entityType, 
        entityId, 
        status: { $in: ['unpaid', 'partial'] } 
      }).sort({ periodYear: 1, periodMonth: 1, createdAt: 1 });

    // Process payment allocations
    for (const bill of targetBills) {
      if (remaining <= 0) break;
      
      const previousBalance = bill.balanceAmount;
      const toApply = Math.min(remaining, bill.balanceAmount);
      
      if (toApply <= 0) continue;

      // Record allocation
      payment.allocations.push({ 
        billId: bill._id as Types.ObjectId, 
        amount: toApply 
      });

      // Update bill
      bill.paidAmount = round2((bill.paidAmount || 0) + toApply);
      bill.balanceAmount = round2(Math.max(0, bill.totalAmount - bill.paidAmount));
      const previousStatus = bill.status;
      bill.status = bill.balanceAmount === 0 ? 'paid' : 'partial';

      // For company payments, also update linked customer bills
      if (entityType === 'company' && bill.isConsolidated) {
        await updateLinkedCustomerBills(bill._id as Types.ObjectId, toApply);
      }

      await bill.save();

      // Create audit entry
      auditEntries.push({
        billId: bill._id,
        billNumber: bill.number,
        allocatedAmount: toApply,
        previousBillBalance: previousBalance,
        newBillBalance: bill.balanceAmount,
        billStatus: bill.status,
      });

      remaining = round2(remaining - toApply);
    }

    // Handle advance payments
    const allocatedTotal = payment.allocations.reduce((s, a) => s + a.amount, 0);
    if (allocatedTotal === 0 && (!payment.reference || payment.reference.trim() === '')) {
      payment.reference = 'ADVANCE';
    }

    await payment.save();

    // Create payment audit trail
    const paymentAudit = new PaymentAudit({
      paymentId: payment._id,
      entityType,
      entityId,
      paymentAmount: Number(amount),
      paymentMethod: method || 'cash',
      paymentDate: new Date(date),
      allocations: auditEntries,
      processedBy,
      notes,
    });

    await paymentAudit.save();

    return res.status(201).json({ 
      success: true, 
      data: { payment, audit: paymentAudit }, 
      message: remaining > 0 ? `Advance recorded: ${remaining}` : 'Payment processed successfully'
    });

  } catch (error: any) {
    console.error('Error recording payment:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to record payment' 
    });
  }
}

async function updateLinkedCustomerBills(companyBillId: Types.ObjectId, companyPaymentAmount: number) {
  // Find all customer bills linked to this company bill
  const customerBills = await Bill.find({ parentBillId: companyBillId });
  
  let remainingPayment = companyPaymentAmount;
  
  for (const custBill of customerBills) {
    if (remainingPayment <= 0) break;
    
    const billShare = custBill.totalAmount;
    const totalCompanyBill = customerBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const paymentShare = (billShare / totalCompanyBill) * companyPaymentAmount;
    
    const toApply = Math.min(paymentShare, custBill.balanceAmount);
    
    if (toApply > 0) {
      custBill.paidAmount = round2((custBill.paidAmount || 0) + toApply);
      custBill.balanceAmount = round2(Math.max(0, custBill.totalAmount - custBill.paidAmount));
      custBill.status = custBill.balanceAmount === 0 ? 'paid' : 'partial';
      
      await custBill.save();
      remainingPayment = round2(remainingPayment - toApply);
    }
  }
}

export async function getPaymentAuditTrail(req: Request, res: Response) {
  try {
    const { entityType, entityId, paymentId } = req.query as any;
    
    const filter: any = {};
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = new Types.ObjectId(String(entityId));
    if (paymentId) filter.paymentId = new Types.ObjectId(String(paymentId));

    const auditTrail = await PaymentAudit.find(filter)
      .populate('paymentId')
      .populate('allocations.billId')
      .sort({ paymentDate: -1 });

    res.json({ success: true, data: auditTrail });
  } catch (error: any) {
    console.error('Error fetching payment audit trail:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch audit trail' 
    });
  }
}

export async function getBillsWithDualBilling(req: Request, res: Response) {
  try {
    const { entityType, entityId, includeLinked } = req.query as any;
    
    const filter: any = {};
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = new Types.ObjectId(String(entityId));

    let bills = await Bill.find(filter)
      .populate('entityId')
      .populate('parentBillId')
      .sort({ periodYear: -1, periodMonth: -1, createdAt: -1 });

    // If requesting company bills and includeLinked is true, also get customer bills
    if (entityType === 'company' && includeLinked === 'true') {
      const customerBills = await Bill.find({ 
        parentBillId: { $in: bills.map(b => b._id) } 
      })
      .populate('entityId')
      .populate('parentBillId');
      
      bills = [...bills, ...customerBills];
    }

    res.json({ success: true, data: bills });
  } catch (error: any) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch bills' 
    });
  }
}

// Legacy compatibility - keep existing function
export async function recordPayment(req: Request, res: Response) {
  return recordPaymentDualBilling(req, res);
}

export async function listPayments(req: Request, res: Response) {
  try {
    const { entityType, entityId } = req.query as any;
    const filter: any = {};
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = new Types.ObjectId(String(entityId));

    const payments = await Payment.find(filter)
      .populate('allocations.billId')
      .sort({ date: -1 });

    res.json({ success: true, data: payments });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch payments' 
    });
  }
}