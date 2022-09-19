const express = require("express");

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "cricketTeam.db");

let db = null;

const intializeDbandServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};

intializeDbandServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// GET all players
app.get("/players/", async (request, response) => {
  const playersQuery = `
    SELECT *
    FROM 
    cricket_team
    ORDER BY 
    player_id;`;

  const players = await db.all(playersQuery);
  console.log(players);
  response.send(
    players.map((each_player) => convertDbObjectToResponseObject(each_player))
  );
});

// ADD player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
    INSERT INTO 
       cricket_team (player_name, jersey_number, role)
    VALUES 
      ('${playerName}', ${jerseyNumber}, '${role}');`;

  const dbresponse = await db.run(addPlayer);
  response.send("Player Added to Team");
});

//GET player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersQuery = `
    SELECT 
      *
    FROM 
    cricket_team
    WHERE 
    player_id = ${playerId}`;

  const player = await db.get(playersQuery);
  response.send(convertDbObjectToResponseObject(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role ='${role}'
  WHERE
    player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// DELETE player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
  DELETE FROM
    cricket_team
  WHERE 
    player_id=${playerId};`;

  const player = await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
