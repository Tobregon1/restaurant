
async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/negocios');
    const negocios = await res.json();
    const tenantId = negocios[0].id;
    
    const resMesas = await fetch(`http://localhost:3001/api/mesas/${tenantId}`);
    const mesas = await resMesas.json();
    const mesa = mesas[0];
    
    // Simulate frontend sending full object with createdAt and updatedAt
    const payload = {
      ...mesa,
      estado: 'libre',
      zona: 'Salón', // unsupported field
    };

    const resUpdate = await fetch(`http://localhost:3001/api/mesas/${tenantId}/${mesa.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!resUpdate.ok) {
      const err = await resUpdate.json();
      console.error("PUT Failed:", resUpdate.status, err);
    } else {
      console.log("PUT Success:", await resUpdate.json());
    }
  } catch(e) {
    console.error("Test Error:", e);
  }
}

test();
