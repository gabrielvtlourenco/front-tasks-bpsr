import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, User } from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function CharactersPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [charClass, setCharClass] = useState("Stormblade");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const classes = [
    "Stormblade",
    "Frost Mage",
    "Wind Knight",
    "Verdant Oracle",
    "Heavy Guardian",
    "Marksman",
    "Shield Knight",
    "Beat Performer",
  ];

  // 🔹 Verifica usuário logado e carrega dados
  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate("/");
        return;
      }
      setUser(data.user);

      // busca o nome do profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", data.user.id)
        .single();
      setProfile(prof);

      await loadCharacters(data.user.id);
    }
    loadData();
  }, []);

  async function loadCharacters(userId) {
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("user_id", userId);
    if (error) console.error(error);
    setCharacters(data || []);
  }

  // 🔹 Cria personagem
  async function handleCreateCharacter(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.from("characters").insert([
        {
          user_id: user.id,
          name,
          class: charClass,
          created_date: new Date().toISOString(),
        },
      ]);
      if (error) throw error;

      setMessage("✅ Personagem criado!");
      setName("");
      await loadCharacters(user.id);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCharacter(id) {
    if (!confirm("Deseja realmente excluir este personagem?")) return;
    const { error } = await supabase.from("characters").delete().eq("id", id);
    if (error) console.error(error);
    await loadCharacters(user.id);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white transition-all duration-300">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"
          } bg-white/10 backdrop-blur-lg border-r border-white/20 p-6 flex flex-col justify-between transition-all duration-300`}
      >
        {/* Topo */}
        <div>
          <div className="flex flex-col items-center mb-8 transition-all duration-300 relative">
            {/* Botão de menu fixado no topo */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-0 right-0 p-2 rounded-md hover:bg-white/20 transition"
            >
              <Menu size={20} />
            </button>

            {/* Ícone / Título */}
            <div
              className={`flex items-center justify-center w-full mt-10 ${sidebarOpen ? "flex-row gap-2" : "flex-col"
                }`}
            >
              <h2
                className={`font-bold ${sidebarOpen ? "text-2xl flex items-center gap-2" : "text-3xl"
                  }`}
              >
                🎮 {sidebarOpen && "TLCGames"}
              </h2>
            </div>
          </div>
          {profile && (
            <div className="flex items-center gap-2 mb-6">
              <User size={22} />
              {sidebarOpen && (
                <div>
                  <p className="text-sm text-gray-300">Bem-vindo(a)</p>
                  <p className="font-semibold text-lg">{profile.name}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 justify-center bg-red-500 hover:bg-red-600 py-2 rounded-lg font-semibold transition-colors"
          >
            <LogOut size={18} />
            {sidebarOpen && "Sair"}
          </button>
        </div>
      </aside>
      {/* Conteúdo */}
      <main className="flex-1 bg-white text-gray-800 p-10 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8">Meus Personagens</h1>

        {/* Lista */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mb-10">
          {characters.map((char) => (
            <div
              key={char.id}
              className="bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 text-white rounded-xl p-4 shadow-lg backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold">{char.name}</h3>
                <p className="text-sm text-gray-100">{char.class}</p>
              </div>
              <button
                onClick={() => handleDeleteCharacter(char.id)}
                className="mt-4 bg-red-500 hover:bg-red-600 py-1 rounded-lg text-sm font-semibold"
              >
                Excluir
              </button>
            </div>
          ))}
          {characters.length === 0 && (
            <p className="text-gray-600 text-center col-span-full">
              Nenhum personagem criado ainda.
            </p>
          )}
        </div>

        {/* Botão adicionar */}
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-colors"
        >
          + Adicionar personagem
        </button>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md text-gray-800 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Novo personagem
            </h2>

            <form onSubmit={handleCreateCharacter} className="space-y-5">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Nome do personagem
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Digite o nome"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Classe</label>
                <select
                  value={charClass}
                  onChange={(e) => setCharClass(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {classes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50"
                >
                  {loading ? "Criando..." : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}