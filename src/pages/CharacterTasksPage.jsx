import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Menu, ArrowLeft, Edit } from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function CharacterTasksPage() {
  const { id } = useParams(); // character_id
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [character, setCharacter] = useState(null);
  const [dailyRoutines, setDailyRoutines] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);

  useEffect(() => {
    loadCharacter();
    loadDailyRoutines();
    loadWeeklyTasks();
  }, []);

  async function loadCharacter() {
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      navigate("/characters");
      return;
    }

    setCharacter(data);
  }

  async function loadDailyRoutines() {
    const { data } = await supabase
      .from("daily_routines")
      .select("*")
      .eq("character_id", id);

    setDailyRoutines(data || []);
  }

  async function loadWeeklyTasks() {
    const { data } = await supabase
      .from("weekly_tasks")
      .select("*")
      .eq("character_id", id);

    setWeeklyTasks(data || []);
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white">

      {/* SIDEBAR */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"
          } bg-white/10 backdrop-blur-lg border-r border-white/20 p-6 flex flex-col justify-between transition-all duration-300`}
      >
        {/* Topo */}
        <div>
          <div className="flex flex-col items-center mb-8 relative">

            {/* Botão menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-0 right-0 p-2 rounded-md hover:bg-white/20 transition"
            >
              <Menu size={20} />
            </button>

            {/* Logo */}
            <h2
              className={`font-bold mt-10 ${sidebarOpen ? "text-2xl" : "text-3xl"
                }`}
            >
              🎮 {sidebarOpen && "TLCGames"}
            </h2>
          </div>

          {/* Nome do personagem */}
          {character && (
            <div className="text-center mb-6">
              <p className="text-sm text-gray-300">Personagem</p>
              <p className="font-semibold text-lg">{character.name}</p>
            </div>
          )}

          {/* Botões extras */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate("/characters")}
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg transition"
            >
              {sidebarOpen ? (
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeft size={18} /> Voltar
                </span>
              ) : (
                <ArrowLeft size={18} className="mx-auto" />
              )}
            </button>

            <button
              onClick={() => navigate(`/character/${id}/edit`)}
              className="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition"
            >
              {sidebarOpen ? (
                <span className="flex items-center justify-center gap-2">
                  <Edit size={18} /> Editar personagem
                </span>
              ) : (
                <Edit size={18} className="mx-auto" />
              )}
            </button>
          </div>
        </div>

      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* Título */}
        <h1 className="text-3xl font-bold mb-8 text-white drop-shadow-lg">
          Rotinas e Tarefas
        </h1>

               {/* SEMANAIS */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Tarefas Semanais</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weeklyTasks.map((task) => (
              <div
                key={task.id}
                className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white p-5 rounded-xl shadow-xl"
              >
                <h3 className="text-xl font-semibold">{task.title}</h3>
                <p className="text-sm opacity-80">Semana: {task.week}</p>
              </div>
            ))}

            {weeklyTasks.length === 0 && (
              <p className="opacity-80">Nenhuma tarefa semanal.</p>
            )}
          </div>
        </section>

        {/* ROTINAS DIÁRIAS */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-white">Rotinas Diárias</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dailyRoutines.map((routine) => (
              <div
                key={routine.id}
                className="bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 text-white p-5 rounded-xl shadow-xl"
              >
                <h3 className="text-xl font-semibold">{routine.title}</h3>
                <p className="text-sm opacity-80">{routine.description}</p>
                <p className="mt-2 text-xs opacity-70">
                  Dias: {JSON.stringify(routine.repeat_days)}
                </p>
              </div>
            ))}

            {dailyRoutines.length === 0 && (
              <p className="opacity-80">Nenhuma rotina criada.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}