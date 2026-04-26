import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

const NOTICIAS = [
  {
    id: 1,
    title: 'Nueva Biblioteca Digital Inaugurada',
    excerpt: 'El campus estrena una nueva plataforma con millones de recursos accesibles 24/7.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    category: 'Institucional',
    author: 'Departamento de Comunicaciones',
    date: '26 Abr 2026',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Hackathon Universitaria 2026',
    excerpt: 'Participa en el evento de programación más grande del año y gana increíbles premios.',
    content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    category: 'Eventos',
    author: 'Facultad de Ingeniería',
    date: '24 Abr 2026',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Actualización en Portal de Matrículas',
    excerpt: 'Conoce las nuevas funcionalidades que harán tu proceso de matrícula más ágil.',
    content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    category: 'Académico',
    author: 'Oficina de Registros',
    date: '22 Abr 2026',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'Torneo Deportivo Interfacultades',
    excerpt: 'Las inscripciones están abiertas para todas las disciplinas. ¡Representa a tu facultad!',
    content: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
    category: 'Deportes',
    author: 'Gestión Deportiva',
    date: '20 Abr 2026',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
  }
];

export default function NoticiasPage() {
  const [selectedNoticia, setSelectedNoticia] = useState(null);
  const [filter, setFilter] = useState('Todas');
  
  const categories = ['Todas', 'Institucional', 'Eventos', 'Académico', 'Deportes'];
  
  const filteredNoticias = filter === 'Todas' ? NOTICIAS : NOTICIAS.filter(n => n.category === filter);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Noticias y Avisos</h1>
          <p className="text-gray-500 mt-2 text-lg">Mantente informado sobre lo que ocurre en tu universidad.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === c 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary text-gray-600 dark:text-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredNoticias.map((noticia, i) => (
          <motion.div 
            key={noticia.id} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full flex flex-col group overflow-hidden border-0 shadow-lg shadow-gray-200/50 dark:shadow-black/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-56 overflow-hidden">
                <img src={noticia.image} alt={noticia.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 left-4">
                  <Badge variant="primary" className="bg-white/90 text-primary uppercase tracking-wider text-[10px] font-bold backdrop-blur-sm border-0">{noticia.category}</Badge>
                </div>
              </div>
              <CardContent className="flex-1 flex flex-col p-6">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 space-x-4">
                  <span className="flex items-center"><Calendar size={12} className="mr-1" /> {noticia.date}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors">{noticia.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed flex-1">{noticia.excerpt}</p>
                
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button 
                    onClick={() => setSelectedNoticia(noticia)}
                    className="flex items-center text-sm font-semibold text-primary group-hover:text-primary-600 transition-colors"
                  >
                    Leer artículo completo
                    <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal 
        isOpen={!!selectedNoticia} 
        onClose={() => setSelectedNoticia(null)} 
        title={<span className="flex items-center"><Tag size={18} className="mr-2 text-primary" />{selectedNoticia?.category}</span>}
        className="max-w-2xl w-full p-0 overflow-hidden"
      >
        {selectedNoticia && (
          <div className="flex flex-col">
            <div className="w-full h-64 md:h-80 relative">
              <img src={selectedNoticia.image} alt={selectedNoticia.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{selectedNoticia.title}</h2>
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <div className="flex items-center font-medium"><User size={16} className="mr-2 text-primary" /> {selectedNoticia.author}</div>
                <div className="flex items-center"><Calendar size={16} className="mr-2" /> {selectedNoticia.date}</div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                {selectedNoticia.content}
              </p>
              <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <Button onClick={() => setSelectedNoticia(null)}>Cerrar</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
