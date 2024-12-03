# Microservices Project 
## Author: Ramiro Cejas

---
## How to use
To deploy all the system: `docker-compose up --build`

---
## How it works?
The project consist in 4 microservices and 1 frontend service that use the microservices. All deployed with **Docker Compose**.

---
### Movies-service

This service provide all the movies data, fetching it from the MongoDB.

*In the first run populate the database with 3500 movies, previously fetched from **tmdb.org** and stored in **movies.json***

**It works in the port 3001**

| Endpoint  | Utility |
| -------- | ------- |
| /api/movies/all  | Obtain all the movies data (`id, genre_ids, popularity`) |
| /api/movies/**:id** | Obtain all the movie data with the given id (`id, genre_ids, popularity`)     |

---
### Random-movies-service

This service provide random movies data with custom ammount, fetching it from the **Movies-service**.

**It works in the port 3002**

| Endpoint  | Utility |
| -------- | ------- |
| /api/random/**:count**  | Obtain **count** randoms movies data (`all`)  |

---
### Recommender-service

This service provide 5 recommended movies ids with the top 3 genres in the last 40 movies viewed for an user, it fetch the history data via RabbitMQ form the **History-service**. Ordering it via popularity.

**It works in the port 3003**

| Endpoint  | Utility |
| -------- | ------- |
| /recommendations/**:userId**  | Obtain **5** recommended movies ids for the given userId  |

---
### History-service

This service provide 5 recommended movies ids with the top 3 genres in the last 40 movies viewed for an user, it fetch the history data via RabbitMQ from the **History-service**. Ordering it via popularity.

**It works in the port 3004**

| Endpoint | Body | Utility |
| -------- | ------- | --- |
| /history | `{ userId, movieId, watchedAt }`  | Store in the history the given movieId viewed by the given userId |

---
### Frontend

Frontend developed with **Next.js** v15.
When the user see the details of a movie, it is added to their history. 
The recommendation section is not updated automatically. To update the recommendations you must refresh the page.

---

## Important clarifications 
- The front works with a single user, shared by all instances
- The History-service publish a RabbitMQ message every time the user view a movie
- The Recommender-service read the messages published by the **history-service** to improve the recommendation of the movies