import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material"

export default function AuthPage() {
  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        const user = data.user
        if (user) {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([{ id: user.id, name: name, created_date: new Date() }])
          if (insertError) throw insertError
          alert("Conta criada com sucesso! Agora faça login.")
          setMode("login")
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        window.location.href = "/characters"
      }
    } catch (err) {
      alert("Erro: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
      }}
    >
      <Card
        sx={{
          width: 360,
          p: 3,
          borderRadius: 3,
          boxShadow: 6,
          backgroundColor: "rgba(255,255,255,0.95)",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            align="center"
            fontWeight={700}
            mb={2}
            color="#001C8E"
          >
            {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <TextField
                label="Nome"
                fullWidth
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <TextField
              label="E-mail"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <TextField
              label="Senha"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                background: "linear-gradient(90deg, #4b6cb7 0%, #182848 100%)",
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              ) : mode === "login" ? (
                "Entrar"
              ) : (
                "Cadastrar"
              )}
            </Button>
          </Box>

          <Typography align="center" sx={{ mt: 2 }}>
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <Button onClick={() => setMode("register")} sx={{ textTransform: "none" }}>
                  Criar conta
                </Button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <Button onClick={() => setMode("login")} sx={{ textTransform: "none" }}>
                  Entrar
                </Button>
              </>
            )}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}