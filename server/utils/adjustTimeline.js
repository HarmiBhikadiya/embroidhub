const pool = require('../config/db');

async function adjustStatuses() {
  try {
    const oRes = await pool.query('SELECT OrderID, OrderDate FROM Orders');
    const now = new Date('2026-04-05'); // Current testing date context

    let c = 0, ip = 0, p = 0;

    for (const o of oRes.rows) {
      const orderDate = new Date(o.orderdate);
      const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      
      let status = 'Completed';
      let pStatus = 'Paid';
      
      // If > 30 days old => Fully Completed
      if (diffDays > 30) {
        status = 'Completed';
        pStatus = 'Paid';
        c++;
      } 
      // Medium recency (10 to 30 days old) => Mix of Completed and In Progress
      else if (diffDays <= 30 && diffDays > 10) {
        if (Math.random() > 0.5) {
          status = 'In Progress';
          pStatus = 'Partial';
          ip++;
        } else {
          status = 'Completed';
          pStatus = 'Paid';
          c++;
        }
      } 
      // Very recent (<= 10 days old) => Strictly Pending or In Progress
      else {
        if (Math.random() > 0.6) {
           status = 'Pending';
           pStatus = 'Unpaid';
           p++;
        } else {
           status = 'In Progress';
           pStatus = 'Partial';
           ip++;
        }
      }

      await pool.query('UPDATE Orders SET Status = $1, PaymentStatus = $2 WHERE OrderID = $3', [status, pStatus, o.orderid]);
      
      // Clean up Payments appropriately
      if (pStatus === 'Unpaid') {
        await pool.query('DELETE FROM Payment WHERE OrderID = $1', [o.orderid]);
      }
    }

    // Now securely resync the Production table
    await pool.query('TRUNCATE TABLE Production RESTART IDENTITY CASCADE');
    const mRes = await pool.query('SELECT MachineID FROM Machine');
    const machines = mRes.rows.map(r => r.machineid);
    const eRes = await pool.query("SELECT EmployeeID FROM Employee");
    const activeEmployees = eRes.rows.map(r => r.employeeid);

    const newOrders = await pool.query('SELECT OrderID, OrderDate, Status FROM Orders');
    
    for (const o of newOrders.rows) {
      if (o.status === 'Pending') continue;

      const mId = machines[Math.floor(Math.random() * machines.length)];
      const eId = activeEmployees[Math.floor(Math.random() * activeEmployees.length)];
      
      const startDate = new Date(o.orderdate);
      startDate.setDate(startDate.getDate() + 1);
      const startStr = startDate.toISOString().replace('T', ' ').substring(0, 19);
      
      let endStr = null;
      let qty = 0;
      let remarks = 'Running on machine actively';
      
      if (o.status === 'Completed') {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 2);
        endStr = endDate.toISOString().replace('T', ' ').substring(0, 19);
        qty = Math.floor(Math.random() * 200) + 100;
        remarks = 'QC passed, production logically completed';
      } else if (o.status === 'In Progress') {
        qty = Math.floor(Math.random() * 40) + 10;
      }

      await pool.query(`
        INSERT INTO Production (OrderID, MachineID, EmployeeID, StartDate, EndDate, QuantityProduced, Remarks)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [o.orderid, mId, eId, startStr, endStr, qty, remarks]);
    }
    
    console.log(`Synchronized strictly by Date Tracking: ${c} Completed, ${ip} In Progress, ${p} Pending!`);
  } catch(e) {
    console.error(e);
  }
  process.exit();
}

adjustStatuses();
