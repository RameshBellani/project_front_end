import { useState } from "react";
import { TextField, Button, Container, Paper, Typography, CircularProgress } from "@mui/material";
import io from "socket.io-client";
import Chat from "./Chat";
import './App.css'

const socket = io.connect("http://localhost:3004");
//https://res.cloudinary.com/dwffepf9q/image/upload/v1701420370/d0lroksyakj08y70bpwr.png
const App = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const joinRoom = async () => {
    try {
      setLoading(true);

      if (username !== "" && room !== "") {
        await socket.emit("join_room", { username, room });
        setShowChat(true);
      }
    } catch (error) {
      setError("Failed to join the room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
    maxWidth="sm"
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
    }}
  >
    {!showChat ? (
      <Container>
        <img
    src="https://res.cloudinary.com/dwffepf9q/image/upload/v1701420370/d0lroksyakj08y70bpwr.png"
    alt="Chat Image"
    style={{ maxWidth:'100%', marginBottom: '16px', borderRadius:'40px' }}
  />
      <Paper
        elevation={3}
        sx={{
          padding: 6,
          textAlign: "center",
          Width: 400,
          margin: 6,
          borderRadius: 14,
        }}
      >
        <Typography style={{color:"Gray", fontSize:"30px", borderRadius:"20px", fontWeight:'bold', fontFamily:'roboto', background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(125,185,232,1) 100%)'}} variant="h5" gutterBottom>
          Join A Chat
        </Typography>
        <TextField
          label="Username"
          placeholder="Enter your username"
          variant="outlined"
          fullWidth
          margin="normal"
          onChange={(event) => setUsername(event.target.value)}
        />
        <TextField
          label="Room ID"
          placeholder="Enter room ID"
          variant="outlined"
          fullWidth
          margin="normal"
          onChange={(event) => setRoom(event.target.value)}
        />
        <Button
          sx={{ marginTop: "20px", borderRadius:"20px" }}
          variant="contained"
          color="primary"
          onClick={joinRoom}
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Join A Room"}
        </Button>
        {error && (
          <Typography variant="body2" color="error" sx={{ marginTop: 2 }}>
            {error}
          </Typography>
        )}
      </Paper>
      </Container>
    ) : (
      // Render the Chat component when showChat is true
      // Adjust the following line based on how your Chat component is imported
      <Chat socket={socket} username={username} room={room} />
    )}
  </Container>
  );
};

export default App;






