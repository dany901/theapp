import React from 'react';
import { Shield, Lock, Eye, FileText, CheckCircle, Info } from 'lucide-react';
import logo from '../assets/logo_sharp.png';

const Policies = () => {
  return (
    <main style={{ paddingTop: '100px', maxWidth: '900px', margin: '0 auto', paddingBottom: '80px', paddingLeft: '20px', paddingRight: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
          <img src={logo} alt="theapp" style={{ height: '40px' }} />
          <span style={{ fontSize: '32px', fontWeight: '900', color: '#000' }}>theapp</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aviso Legal y Privacidad (GDPR)</h1>
        <p style={{ opacity: 0.6, fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>Información detallada sobre el tratamiento de sus datos personales conforme al Reglamento (UE) 2016/679.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* GDPR Section */}
        <section style={{ background: 'white', padding: '35px', borderRadius: '28px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: 'var(--primary)' }}>
            <Shield size={26} />
            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>1. Protección de Datos (GDPR)</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', lineHeight: '1.7', opacity: 0.8 }}>
            <p>
              <b>TheApp</b> se compromete plenamente con el <b>Reglamento General de Protección de Datos (RGPD/GDPR)</b>. Procesamos sus datos basándonos en el <b>Art. 6.1.a (Consentimiento)</b> y <b>Art. 6.1.b (Ejecución del contrato)</b>.
            </p>
            <p>
              <b>Transparencia (Art. 13):</b> Sus datos personales (nombre de usuario, email, actividad en la plataforma) se utilizan exclusivamente para proporcionar los servicios de red social de <b>TheApp</b>. No vendemos sus datos a terceros.
            </p>
            <div style={{ background: 'var(--bg-alt)', padding: '20px', borderRadius: '16px', display: 'flex', gap: '12px' }}>
              <Info size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '13px' }}>
                Sus datos están encriptados en reposo y almacenados en servidores seguros con protocolos TLS 1.3 para garantizar la máxima seguridad.
              </p>
            </div>
          </div>
        </section>

        {/* Rights Section */}
        <section style={{ background: 'white', padding: '35px', borderRadius: '28px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#10b981' }}>
            <CheckCircle size={26} />
            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>2. Sus Derechos Legales</h2>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.7', opacity: 0.8, marginBottom: '20px' }}>
            Usted mantiene el control total sobre su información personal en <b>TheApp</b> conforme a los siguientes artículos:
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', lineHeight: '1.6', opacity: 0.8 }}>
            <li><b>Derecho de Acceso (Art. 15):</b> Puede solicitar una copia de todos sus datos almacenados en nuestros sistemas en cualquier momento.</li>
            <li><b>Derecho de Rectificación (Art. 16):</b> Puede corregir cualquier dato inexacto directamente desde su perfil de usuario.</li>
            <li><b>Derecho de Supresión / Olvido (Art. 17):</b> Al eliminar su cuenta, <b>TheApp</b> eliminará permanentemente todos sus datos personales de nuestras bases de datos activas en un plazo máximo de 30 días.</li>
            <li><b>Derecho de Oposición (Art. 21):</b> Puede oponerse al tratamiento de sus datos para fines de marketing o análisis estadístico.</li>
          </ul>
        </section>

        {/* Location Section */}
        <section style={{ background: 'white', padding: '35px', borderRadius: '28px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#f59e0b' }}>
            <Lock size={26} />
            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>3. Geolocalización y Feed Local</h2>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.7', opacity: 0.8 }}>
            Para ofrecer el servicio de "Feed Local", <b>TheApp</b> procesa datos de ubicación aproximada. Este procesamiento se basa en su consentimiento explícito y puede ser revocado desactivando los servicios de ubicación en su dispositivo o en los ajustes de la aplicación. No compartimos su ubicación exacta con otros usuarios.
          </p>
        </section>

        {/* Terms of Service */}
        <section style={{ background: 'white', padding: '35px', borderRadius: '28px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#6b7280' }}>
            <FileText size={26} />
            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>4. Términos y Condiciones (Servicio)</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', lineHeight: '1.7', opacity: 0.8 }}>
            <p>
              El uso de la aplicación <b>TheApp</b> implica la aceptación incondicional de estas reglas de uso y conducta de la plataforma. Como usuario se compromete a actuar éticamente, absteniéndose de utilizar la App para fines ilícitos o perjudiciales.
            </p>
            <p>
              <b>TheApp</b> se reserva el derecho de admitir, moderar o sancionar y eliminar cualquier cuenta que infrinja la seguridad, difunda contenido inadecuado o violente los parámetros de la comunidad, sin requerir notificación previa.
            </p>
          </div>
        </section>

        {/* EULA */}
        <section style={{ background: 'white', padding: '35px', borderRadius: '28px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#8b5cf6' }}>
            <Shield size={26} />
            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>5. Contrato de Licencia EULA</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', lineHeight: '1.7', opacity: 0.8 }}>
            <p>
              <b>El Contrato de Licencia para el Usuario Final (EULA)</b> establece que TheApp otorga al usuario una licencia revocable, no exclusiva, intransferible y limitada para descargar, instalar y utilizar la aplicación estrictamente de acuerdo con los términos de este acuerdo.
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><b>Pagos, Suscripciones y Cancelaciones:</b> Los pagos se procesarán a través de Google Play Store. Al adquirir una suscripción, esta se renovará automáticamente al final de cada periodo (mensual/anual) a menos que se cancele desde la <a href="https://play.google.com/store/account/subscriptions" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary)', textDecoration: 'underline'}}>sección de Suscripciones en Google Play</a> al menos 24 horas antes de la renovación. Las compras no son reembolsables una vez procesadas, y Google no ofrece reembolsos prorrateados. Nos reservamos el derecho de modificar el precio previa notificación. Si hay periodo de prueba, se cobrará automáticamente al concluir dicho periodo sin haber cancelado.</li>
              <li><b>Propiedad Intelectual:</b> Usted reconoce que no es dueño del código, el branding ni del software. Queda totalmente prohibido aplicar ingeniería inversa, piratear o robar recursos estéticos e intelectuales de TheApp.</li>
              <li><b>Exención de Responsabilidad:</b> La aplicación se entrega en su estado actual (\"tal cual\"). TheApp no asume garantías sobre hardware derivado de mal uso o desgaste (por ejemplo, consumo de batería derivado del uso prolongado).</li>
              <li><b>Modificaciones:</b> Nos reservamos el derecho exclusivo de modificar, suspender o descontinuar la aplicación de forma temporal o permanente, en cualquier momento.</li>
            </ul>
          </div>
        </section>

        {/* Version History */}
        <section style={{ background: 'white', padding: '35px', borderRadius: '28px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#0ea5e9' }}>
            <Info size={26} />
            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>Historial de Versiones</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', lineHeight: '1.7', opacity: 0.8 }}>
            <div style={{ padding: '15px', background: 'var(--bg-alt)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '16px' }}>v1.0.1 (Capacitor Build)</strong>
                <span style={{ fontSize: '12px', opacity: 0.6 }}>12 de Abril, 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Integración del marco normativo y EULA para compras intra-app (Google Play).</li>
                <li>Habilitación y estabilización del botón de "Contacto" (Mailto) nativo.</li>
                <li>Embebido y configuración nativa de Capacitor y Android SDK para renderizado en formato <code>.apk</code>.</li>
              </ul>
            </div>
            <div style={{ padding: '15px', background: 'transparent', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '16px', opacity: 0.7 }}>v1.0.0 (Lanzamiento)</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', opacity: 0.7 }}>
                <li>Lanzamiento inicial de TheApp (Social Media Feed, Likes, y chat).</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <div style={{ textAlign: 'center', marginTop: '50px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '30px' }}>
        <p style={{ opacity: 0.4, fontSize: '12px', fontWeight: 'bold' }}>Última actualización: 11 de Abril, 2026</p>
        <p style={{ opacity: 0.2, fontSize: '10px' }}>TheApp Social Media LTD - contact@theapp.pro</p>
      </div>
    </main>
  );
};

export default Policies;
