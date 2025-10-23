import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  TextField,
  Button,
  Divider,
} from "@mui/material"

export default function TasksPage() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")

  // pega o usuário atual
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })
  }, [])

  // carrega tarefas da tabela daily_tasks
  useEffect(() => {
    if (user) fetchTasks()
  }, [user])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("daily_tasks")
      .select("*")
      .order("created_date", { ascending: false })

    if (error) console.error(error)
    else setTasks(data)
  }

  async function addTask() {
    if (!newTask.trim()) return
    const { error } = await supabase.from("daily_tasks").insert([
      {
        title: newTask,
        date: new Date(),
        completed: false,
        created_date: new Date(),
        // substitua abaixo se quiser vincular ao personagem depois
        character_id: null,
      },
    ])
    if (!error) {
      setNewTask("")
      fetchTasks()
    }
  }

  async function toggleComplete(task) {
    const { error } = await supabase
      .from("daily_tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id)
    if (!error) fetchTasks()
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        🗓️ Suas tarefas de hoje
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          label="Nova tarefa"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <Button variant="contained" onClick={addTask}>
          Adicionar
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {tasks.length === 0 ? (
        <Typography color="text.secondary">
          Nenhuma tarefa registrada ainda.
        </Typography>
      ) : (
        tasks.map((task) => (
          <Card key={task.id} sx={{ mb: 1 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                checked={task.completed}
                onChange={() => toggleComplete(task)}
              />
              <Typography
                sx={{
                  textDecoration: task.completed ? "line-through" : "none",
                }}
              >
                {task.title}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  )
}