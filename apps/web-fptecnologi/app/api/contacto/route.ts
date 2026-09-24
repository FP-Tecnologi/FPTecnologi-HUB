import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, company, message } = body;

    if (!name || (!email && !phone && !message)) {
      return NextResponse.json({ error: 'Por favor ingresa tu nombre y mensaje o datos de contacto.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dsanzenhbrtpovtjxmbt.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzYW56ZW5oYnJ0cG92dGp4bWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMTM3NzYsImV4cCI6MjEwNTc4OTc3Nn0.lMSLrn9R22VLqqARb6RWug4PGP3FmT6dZOtZUPrIFXU';

    // 1. Guardar lead en Supabase (Sistema de Centralización de Leads)
    try {
      await fetch(`${supabaseUrl}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          nombres: name,
          email: email || null,
          telefono: phone || null,
          empresa: company || null,
          origen: 'web-fptecnologi-contacto',
          extra: { mensaje: message || '' },
        }),
      });
    } catch (err) {
      console.error('Error guardando lead en Supabase:', err);
    }

    // 2. Notificar / registrar en la API Central NestJS (Dashboard)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    try {
      const serviciosRes = await fetch(`${apiUrl}/public/servicios`, { cache: 'no-store' }).catch(() => null);
      let servicioId = null;
      if (serviciosRes && serviciosRes.ok) {
        const serviciosData = await serviciosRes.json();
        const lista = Array.isArray(serviciosData) ? serviciosData : serviciosData.data;
        if (Array.isArray(lista) && lista.length > 0) {
          servicioId = lista[0].id;
        }
      }

      if (servicioId) {
        await fetch(`${apiUrl}/cotizaciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            servicioId,
            clienteNombre: name,
            clienteEmail: email || 'contacto@fptecnologi.com',
            clienteTelefono: phone || '',
            mensaje: company ? `Empresa: ${company} | ${message}` : message,
          }),
        });
      }
    } catch (err) {
      console.error('Error enviando a API NestJS:', err);
    }

    return NextResponse.json({ success: true, message: '¡Gracias! Tu mensaje ha sido enviado exitosamente.' });
  } catch (err) {
    console.error('Error en /api/contacto:', err);
    return NextResponse.json({ error: 'Error procesando la solicitud' }, { status: 500 });
  }
}
