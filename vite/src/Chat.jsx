import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  Box,
  ListItemText,
  List,
  ListItem,
  Avatar,
  Grid,
} from "@mui/material";
import { blueGrey } from "@mui/material/colors";

function CustomAvatar({ username, status }) {
  const avatarContent = username ? username[0].toUpperCase() : "";
  const avatarColor = status === "online" ? "#4CAF50" : "red";

  return (
    <Avatar sx={{ bgcolor: avatarColor, width: 40, height: 40, marginRight: 1 }}>
      {avatarContent}
    </Avatar>
  );
}

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    socket.on("chat_history", (history) => {
      setMessageList(history);
    });

    return () => {
      socket.off("chat_history");
    };
  }, [socket]);

  useEffect(() => {
    const handleDisconnecting = () => {
      // Update user status to "offline" before disconnecting
      socket.emit("disconnecting");
    };

    window.addEventListener("beforeunload", handleDisconnecting);

    return () => {
      window.removeEventListener("beforeunload", handleDisconnecting);
    };
  }, [socket]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  useEffect(() => {
    socket.on("update_users", (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on("typing_users", (typingData) => {
      setTypingUsers(typingData);
    });

    return () => {
      socket.off("update_users");
      socket.off("typing_users");
    };
  }, [socket]);

  const isUserTyping = (userId) => typingUsers.includes(userId);

  return (
    <Container style={{ display: "flex", justifyContent: "center" }}>
      {/* Chat Window Container */}
      <Container component="main" style={{ width:'100%', marginTop: "40px", flex: 1 }}>
        <Paper elevation={3} style={{ width:"100%", height: "100%", borderRadius:"20px" }}>
          <Box p={2} display="flex" alignItems="center" bgcolor={blueGrey}>
            <CustomAvatar username={username} />
            <Typography variant="h5">
              Live Chat{" "}
              <span style={{ fontFamily: "Fantasy", fontSize: "1rem", color: "grey" }}>{username}</span>
            </Typography>
          </Box>
          <Box p={2} style={{ height:"50vh", width:"40vh", overflowY: "auto" }}>
            <Grid container direction="column" spacing={2}>
              {messageList.map((messageContent, index) => (
                <Grid
                  key={index}
                  item
                  style={{
                    alignSelf: username === messageContent.author ? "flex-start" : "flex-end",
                  }}
                >
                  <Box
                    bgcolor={
                      username === messageContent.author ? "#43a047" : "cornflowerblue"
                    }
                    color="white"
                    borderRadius={5}
                    p={1}
                    display="flex"
                    alignItems="center"
                    maxWidth="80%"
                    alignSelf="flex-start"
                    overflowWrap="break-word"
                    wordBreak="break-word"
                  >
                    <Typography variant="body1">{messageContent.message}</Typography>
                  </Box>
                  <Box  display="flex" fontSize={12}>
                    <Typography id="time">{messageContent.time}</Typography>
                    <Typography id="author" marginLeft={1} fontWeight="bold">
                      {messageContent.author}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
          <Box p={2} display="flex" alignItems="center">
            <TextField
              fullWidth
              variant="outlined"
              value={currentMessage}
              placeholder="Hey..."
              onChange={(event) => setCurrentMessage(event.target.value)}
              onKeyPress={(event) => event.key === "Enter" && sendMessage()}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={sendMessage}
              style={{ marginLeft: "10px", borderRadius:'10px' }}
            >
              Send
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Online Users Container */}
      <Container p={2} style={{ width: "40vh", bgcolor:'lightblue', marginTop:'40px', flexShrink: 0 }}>
        <Typography variant="h6" style={{fontFamily:"Roboto", fontSize:"28px", fontStyle:"italic", fontWeight:"bold"}}>Online Users</Typography>
        <List>
          {users.map((user) => (
            <ListItem key={user.username} alignItems="center">
              <CustomAvatar username={user.username} status={user.status} />
              <ListItemText
                primary={`${user.username} (${user.status})`}
                secondary={isUserTyping(user.id) ? "Typing..." : ""}
              />
            </ListItem>
          ))}
        </List>
      </Container>
    </Container>
  );
}

Chat.propTypes = {
    socket: PropTypes.object.isRequired,
    username: PropTypes.string.isRequired,
    room: PropTypes.string.isRequired,
  };

export default Chat;
