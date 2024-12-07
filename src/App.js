import React, { useState, useEffect } from "react";

const App = () => {
  const [actions, setActions] = useState([]);
  const [hash, setHash] = useState(generateRandomHash());

  useEffect(() => {
    const localStorageHash = localStorage.getItem("cacheHash");

    if (localStorageHash) {
      newAction({
        type: "connect",
        firstLoad: true,
        cacheHash: localStorageHash,
        origin: document.referrer,
      });
    } else {
      const cacheHashNew = generateRandomHash();
      localStorage.setItem("cacheHash", cacheHashNew);
      newAction({ type: "connect", firstLoad: true, cacheHash: cacheHashNew });
    }
  }, []);

  useEffect(() => {
    const handleClick = async (event) => {
      const target = event.target;
      if (target.id && target.id.includes("id")) {
        const [, id] = target.id.split("_");

        const actionClick = newAction({ type: "click", id });

        const ws = new WebSocket("ws://localhost:8080");
        ws.onopen = () => {
          ws.send(JSON.stringify([actionClick]));
        };

        if (target.id === "id_3") {
          returnGoogle();
        }
      }
    };

    const handleMouseOver = (event) => {
      const target = event.target;

      if (target.id && target.id.includes("id")) {
        const [, id] = target.id.split("_");
        newAction({ type: "hover", id });
      }
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      sendMessage();
    }, 2500);

    return () => clearInterval(interval);
  }, [actions]);

  const sendMessage = async () => {
    if (actions.length) {
      const ws = new WebSocket("ws://localhost:8080");
      ws.onopen = () => {
        ws.send(JSON.stringify(actions));
      };
      setActions([]);

      await new Promise((resolve) => {
        ws.onclose = resolve;
      });
    }
  };

  function generateRandomHash() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let hash = "";
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      hash += characters[randomIndex];
    }
    return hash;
  }

  const newAction = (val) => {
    setActions((prev) => [...prev, { ...val, date: new Date(), hash }]);

    return { ...val, date: new Date(), hash };
  };

  function returnGoogle() {
    window.location = "https://google.com";
  }

  return (
    <div id="id_823">
      <h1>Status da Página</h1>
      <button id="id_3">Clicou</button>
    </div>
  );
};

export default App;
