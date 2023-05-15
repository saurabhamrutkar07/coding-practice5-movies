const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const { request } = require("http");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

function convertToCamelCase(item) {
  return {
    movieId: item.movie_id,
    directorId: item.director_id,
    movieName: item.movie_name,
    leadActor: item.lead_actor,
  };
}

function directorConvertToCamelCase(item) {
  return {
    directorId: item.director_id,
    directorName: item.director_name,
  };
}
function movieconvertToCamelCase(item) {
  return {
    movieName: item.movie_name,
  };
}

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(1110, () => {
      console.log("Server is running at http://localhost:1110");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// API 1 get Movies List

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
  SELECT * 
  FROM movie; 
  `;
  const movieArray = await db.all(getMoviesQuery);
  console.log(movieArray);
  const op = movieArray.map((eachItem) => movieconvertToCamelCase(eachItem));
  response.send(op);
});

// API 2 post new movie

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  console.log(directorId, movieName, leadActor);
  const postMovieQuery = `
  INSERT INTO movie (movie_id, director_id, movie_name, lead_actor)
  VALUES (${117}, ${directorId}, '${movieName}', '${leadActor}');
  `;

  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3 get movie by ID

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const getMovieByIdQuery = `
  SELECT *
  FROM movie
  WHERE movie_id = ${movieId};
  `;
  const movie = await db.get(getMovieByIdQuery);
  console.log(movie);

  const op = convertToCamelCase(movie);
  response.send(op);
});

// API 4 Update/ PUT API

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
  UPDATE movie
  SET movie_id= ${movieId},
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor ='${leadActor}'

    WHERE movie_id = ${movieId};
  `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API 5 Delete

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const deleteMovieQuery = `
  DELETE FROM 
   movie
  WHERE 
   movie_id = ${movieId};
  `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// API 6 Directors table

app.get("/directors", async (request, response) => {
  const getDirectorQuery = `
  SELECT * 
  FROM director;`;

  const directorArray = await db.all(getDirectorQuery);
  const op = directorArray.map((eachDirector) =>
    directorConvertToCamelCase(eachDirector)
  );
  response.send(op);
});

// API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
//   const movieByDirectorIdQuery = `
//   SELECT movie.movie_name
//   FROM movie INNER JOIN director ON movie.director_id = director.director_id
//   ORDER BY movie_name;`;
  
  const movieByDirectorIdQuery = `
  SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  `

  const movieArray = await db.all(movieByDirectorIdQuery);
  const op = movieArray.map((eachMovie) => movieconvertToCamelCase(eachMovie));
  // console.log(op);
  response.send(op);
});

module.exprots = app;
