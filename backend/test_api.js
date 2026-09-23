
async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/negocios');
    const negocios = await res.json();
    console.log("Negocios:", negocios);
    
    if (negocios.length > 0) {
      const tenantId = negocios[0].id;
      const resMesas = await fetch(`http://localhost:3001/api/mesas/${tenantId}`);
      const mesas = await resMesas.json();
      console.log("Mesas:", mesas);
      
      if (mesas.length > 0) {
        const mesaId = mesas[0].id;
        const resUpdate = await fetch(`http://localhost:3001/api/mesas/${tenantId}/${mesaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: 'ocupada' })
        });
        const updateData = await resUpdate.json();
        console.log("Update Mesa Response:", resUpdate.status, updateData);
      } else {
        console.log("No mesas found for tenant.");
      }
    }
  } catch(e) {
    console.error("Test Error:", e);
  }
}

test();
