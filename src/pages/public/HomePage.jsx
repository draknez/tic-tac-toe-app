import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      {/* HERO SECTION */}
      <div className="text-center space-y-6 mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full text-xs font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
          Sistema BaLog v4.0 Activo
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
          Tu estructura web <br/> 
          <span className="text-teal-600">profesional y segura.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Gestión organizacional avanzada, roles jerárquicos y <span className="text-teal-600 font-bold">Tres en Raya competitivo</span>. 
          Diseñado para escalar con los más altos estándares de seguridad y experiencia de usuario.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          {user ? (
            <>
              <Link to="/game">
                <Button size="lg" className="bg-teal-600 text-white px-8 h-14 text-base font-bold shadow-xl shadow-teal-500/20 hover:scale-105 transition-transform uppercase tracking-widest">
                  🎮 Jugar 3 en Raya
                </Button>
              </Link>
              <Link to="/profile">
                <Button size="lg" variant="ghost" className="px-8 h-14 text-base font-bold hover:bg-gray-100 dark:hover:bg-gray-800 uppercase tracking-widest">
                  Mi Perfil
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button size="lg" className="bg-teal-600 text-white px-8 h-14 text-base font-bold shadow-xl shadow-teal-500/20 hover:scale-105 transition-transform">
                  Comenzar ahora
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="ghost" className="px-8 h-14 text-base font-bold hover:bg-gray-100 dark:hover:bg-gray-800">
                  Crear cuenta
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* FEATURES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
          <div className="w-12 h-12 bg-sky-500/10 text-sky-500 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
            🛡️
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Seguridad Génesis</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Protección robusta mediante JWT, encriptación Bcrypt y lógica Génesis para el primer administrador del sistema.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
            📊
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Control Total</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Gestión jerárquica de grupos hasta 5 niveles. Administra usuarios, asigna encargados y supervisa cada nodo.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
          <div className="w-12 h-12 bg-teal-500/10 text-teal-500 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
            ⚡
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Monitor Live</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Visualiza estadísticas en tiempo real sobre el estado del servidor, usuarios online y métricas críticas del sistema.
          </p>
        </div>
      </div>

      {/* FOOTER SIMPLE */}
      <div className="text-center border-t border-gray-100 dark:border-gray-800 pt-12">
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em]">
          BaLog Ecosystem &copy; 2026 • Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default HomePage;
