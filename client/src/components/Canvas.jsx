import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import canvasState from "../store/canvasState";
import toolState from "../store/toolState";
import Brush from "../tools/Brush";
import Rect from "../tools/Rect";
import Circle from "../tools/Circle";
import Eraser from "../tools/Eraser";
import "../styles/canvas.scss";
import { Modal, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";

const Canvas = observer(() => {
  const canvasRef = useRef();
  const usernameRef = useRef();
  const [modal, setModal] = useState(true);
  const params = useParams();

  useEffect(() => {
    canvasState.setCanvas(canvasRef.current);
    const ctx = canvasRef.current.getContext("2d");
    axios.get(`http://localhost:8080/image?id=${params.id}`).then((response) => {
      const img = new Image();
      img.src = response.data;
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      };
    });
  }, []);

  useEffect(() => {
    if (canvasState.username) {
      const socket = new WebSocket(`ws://localhost:8080/`);
      console.log(socket);
      canvasState.setSocket(socket);
      canvasState.setSessionId(params.id);
      toolState.setTool(new Brush(canvasRef.current, socket, params.id));

      socket.onopen = () => {
        console.log("connected");
        socket.send(
          JSON.stringify({
            id: params.id,
            username: canvasState.username,
            method: "connection",
          })
        );
      };
      socket.onmessage = (event) => {
        let msg = JSON.parse(event.data);
        // eslint-disable-next-line default-case
        switch (msg.method) {
          case "connection":
            console.log(`user ${msg.username} connected`);
            break;
          case "draw":
            drawHandler(msg);
            break;
        }
      };
    }
  }, [canvasState.username]);

  const drawHandler = (msg) => {
    const figure = msg.figure;
    const ctx = canvasRef.current.getContext("2d");
    // eslint-disable-next-line default-case
    switch (figure.type) {
      case "brush":
        Brush.draw(ctx, figure.x, figure.y, toolState.color);
        break;
      case "rect":
        Rect.staticDraw(
          ctx,
          figure.x,
          figure.y,
          figure.width,
          figure.height,
          figure.color,
          figure.stroke,
          figure.lineWidth
        );
        break;
      case "circle":
        Circle.staticDraw(
          ctx,
          figure.x,
          figure.y,
          figure.width,
          figure.height,
          figure.color,
          figure.stroke,
          figure.lineWidth
        );
        break;
      case "eraser":
        Eraser.staticDrawEr(ctx, figure.x, figure.y);
          break;
      case "finish":
        ctx.beginPath();
        break;
    }
  };

  const mouseDownHandler = () => {
    canvasState.pushToUndo(canvasRef.current.toDataURL());
    axios
      .post(`http://localhost:8080/image?id=${params.id}`, { img: canvasRef.current.toDataURL() })
      .then((response) => console.log(response.data));
  };

  const connectHandler = () => {
    canvasState.setUsername(usernameRef.current.value);
    setModal(false);
  };

  return (
    <div className="canvas">
      <Modal show={modal} onHide={() => {}}>
        <Modal.Header>
          <Modal.Title>Enter your name !</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type="text" ref={usernameRef} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => connectHandler()}>
            Enter
          </Button>
        </Modal.Footer>
      </Modal>
      <canvas onMouseDown={() => mouseDownHandler()} ref={canvasRef} width={600} height={400} />
    </div>
  );
});

export default Canvas;
