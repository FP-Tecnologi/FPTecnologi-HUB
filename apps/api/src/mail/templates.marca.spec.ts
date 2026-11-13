import { describe, expect, it } from 'vitest';
import { asunto, avisoEmail, invitacionEmail, otpCodeEmail, tema, welcomeEmail } from './templates.js';

const imaninki = { nombre: 'Imaninki', color: '#C8102E', logo: null, email: 'hola@imaninki.com' };

describe('correos personalizados por marca', () => {
  it('usa nombre, color y contacto de la marca en cabecera, código, asunto y pie', () => {
    const { subject, html } = otpCodeEmail('123456', 10, imaninki);
    expect(subject).toBe('Tu código de verificación · Imaninki');
    expect(html).toContain('background:#C8102E');
    expect(html).toContain('Imaninki');
    expect(html).toContain('hola@imaninki.com');
    expect(html).not.toContain('#008DC5');
  });

  it('sin marca cae en FPTecnologi y su azul', () => {
    const { subject, html } = otpCodeEmail('123456', 10);
    expect(subject).toBe('Tu código de verificación · FPTecnologi');
    expect(html).toContain('#008DC5');
  });

  it('no repite el nombre si el asunto ya lo trae', () => {
    expect(asunto('Bienvenido a Fimav', { nombre: 'Fimav' })).toBe('Bienvenido a Fimav');
    expect(welcomeEmail('Ana', { nombre: 'Fimav' }).subject).toBe('Bienvenido a Fimav');
  });

  it('el botón del aviso y la invitación toman el color de la marca; un color claro invierte el texto', () => {
    expect(avisoEmail({ asunto: 'x', titulo: 't', parrafos: [], boton: { texto: 'Ir', url: 'https://a.b' }, marca: imaninki }).html).toContain('background:#C8102E;color:#FFFFFF');
    expect(invitacionEmail('Imaninki', 'admin', 'https://a.b', 7, imaninki).html).toContain('background:#C8102E');
    expect(tema({ nombre: 'Plata', color: '#C0C0C0' }).sobre).toBe('#1F2733');
  });

  it('ignora un color inválido y escapa el nombre', () => {
    expect(tema({ nombre: 'X', color: 'rojo' }).color).toBe('#008DC5');
    expect(otpCodeEmail('1', 1, { nombre: '<b>Mala</b>' }).html).not.toContain('<b>Mala</b>');
  });
});
