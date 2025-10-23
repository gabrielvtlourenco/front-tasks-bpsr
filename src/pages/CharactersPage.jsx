import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material"

export default function CharactersPage() {
  const [user, setUser] = useState(null)
  const [characters, setCharacters] = useState([])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [charClass, setCharClass] = useState("")
  const [loading, setLoading] = useState(false)

  // pega o usuário logado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })
  }, [])

  // carrega personagens do usuário
  useEffect(() => {
    if (user) fetchCharacters()
  }, [user])

  async function fetchCharacters() {
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("user_id", user.id)
      .order("created_date", { ascending: true })

    if (error) console.error(error)
    else setCharacters(data)
  }

  async function createCharacter() {
    if (!name.trim() || !charClass.trim()) return
    setLoading(true)

    const { error } = await supabase.from("characters").insert([
      {
        user_id: user.id,
        name,
        class: charClass,
        created_date: new Date(),
      },
    ])

    setLoading(false)
    if (!error) {
      setOpen(false)
      setName("")
      setCharClass("")
      fetchCharacters()
    } else {
      alert("Erro ao criar personagem: " + error.message)
    }
  }

  function goToTasks(character) {
    window.location.href = `/tasks?character=${character.id}`
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 3,
        background: "linear-gradient(135deg, #1c92d2 0%, #f2fcfe 100%)",
      }}
    >
      <Typography variant="h4" fontWeight={700} mb={3} color="#002B5B">
        👤 Seus Personagens
      </Typography>

      {characters.length === 0 ? (
        <>
          <Typography color="text.secondary" mb={2}>
            Nenhum personagem criado ainda.
          </Typography>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Criar primeiro personagem
          </Button>
        </>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 2,
              width: "100%",
              maxWidth: 800,
            }}
          >
            {characters.map((c) => (
              <Card
                key={c.id}
                sx={{
                  cursor: "pointer",
                  "&:hover": { boxShadow: 6 },
                }}
                onClick={() => goToTasks(c)}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600}>
                    {c.name}
                  </Typography>
                  <Typography color="text.secondary">{c.class}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Button
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={() => setOpen(true)}
          >
            Adicionar novo personagem
          </Button>
        </>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Criar personagem</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nome do personagem"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Classe"
            value={charClass}
            onChange={(e) => setCharClass(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={createCharacter} disabled={loading} variant="contained">
            {loading ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}