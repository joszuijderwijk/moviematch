# MovieMatch

[![Docker Pulls](https://img.shields.io/docker/pulls/iovidius/moviematch?label=Docker+Hub)](https://hub.docker.com/repository/docker/iovidius/moviematch)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/joszuijderwijk/moviematch?label=Latest+release)](https://github.com/joszuijderwijk/moviematch/releases)

<div style="text-align: center">
  <a href="screenshots/Splash.jpeg"><img src="screenshots/Splash.jpeg" alt="Splash Screen" width="25%"></a>
  <a href="screenshots/e2e_login_page_iphone_x.jpeg"><img src="screenshots/e2e_login_page_iphone_x.jpeg" alt="Splash Screen" width="25%"></a>
  <a href="screenshots/Rate.jpeg"><img src="screenshots/Rate.jpeg" alt="Splash Screen" width="25%"></a>
</div>

Have you ever spent longer deciding on a movie than it'd take to just watch a
random movie? This is an app that helps you and your friends pick a movie to
watch from a [Plex](https://www.plex.tv) server.

## How it works

MovieMatch connects to your Plex server and gets a list of movies (from any
libraries marked as a movie library).

As many people as you want connect to your MovieMatch server and get a list of
shuffled movies. Swipe right to 👍, swipe left to 👎.

If two (or more) people swipe right on the same movie, it'll show up in
everyone's matches. The movies that the most people swiped right on will show up
first.

## Getting started

### Option 1: Using Docker (Easiest)

**From DockerHub:**

```bash
docker run -it -e PLEX_URL=https://plex.example.com -e PLEX_TOKEN=your-token -p 8000:8000 --pull always joszuijderwijk/moviematch:latest
```

**From GitHub Container Registry (GHCR):**

```bash
docker run -it -e PLEX_URL=https://plex.example.com -e PLEX_TOKEN=your-token -p 8000:8000 --pull always ghcr.io/joszuijderwijk/moviematch:latest
```

**With docker-compose:**

See [docker-compose documentation](./docs/docker-compose.markdown)


### Image Sources

- **DockerHub**: `iovidius/moviematch:latest`
- **GHCR**: `ghcr.io/joszuijderwijk/moviematch:latest`
- **Binaries**: Available on
  [GitHub Releases](https://github.com/joszuijderwijk/moviematch/releases)

## Extra Features in This Fork

- Trailer button in the card info panel (opens a YouTube trailer search)
- External ratings from Plex metadata (IMDb/Rotten Tomatoes where available)
- Rating filters: Filter movies by IMDb/critic scores and audience ratings when creating a room
- Expanded card details (descriptions + improved metadata display)
- Updated translations and UI copy
- Docker images published to both DockerHub and GHCR


## Configuration

The following variables are supported via a `.env` file or environment
variables.

| Name                 | Description                                                                                                                                                           | Required | Default                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| HOST                 | The host interface the server will listen on                                                                                                                          | No       | 127.0.0.1                                                                                                            |
| PORT                 | The port the server will run on                                                                                                                                       | No       | 8000                                                                                                                 |
| PLEX_URL             | A URL for the Plex server, e.g. `https://plex.example.com:32400`                                                                                                      | Yes      | null                                                                                                                 |
| PLEX_TOKEN           | An authorization token for access to the Plex API. [How to find yours](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/)      | Yes      | null                                                                                                                 |
| AUTH_USER            | Basic Authentication User Name                                                                                                                                        | No       | null                                                                                                                 |
| AUTH_PASS            | Basic Authentication Password                                                                                                                                         | No       | null                                                                                                                 |
| REQUIRE_PLEX_LOGIN   | Require that all users log in with Plex as opposed to the anonymous login                                                                                             | No       | Both Plex and Anonymous logins are permitted                                                                         |
| ROOT_PATH            | The root path to use when loading resources. For example, if MovieMatch is on a sub-path, the `ROOT_PATH` should be set to that sub-path (_without a trailing slash_) | No       | ''                                                                                                                   |
| LIBRARY_TITLE_FILTER | A list of libraries to be included in the cards, comma-separated. e.g. `Films`, or `Films,Television`, or `Films,Workout Videos`                                      | No       | null                                                                                                                 |
| LIBRARY_TYPE_FILTER  | Only libraries of these types will be used                                                                                                                            | No       | `movie`, (can be `movie`, `artist`, `photo`, or `show`). Multiple options must be comma-separated, e.g. `movie,show` |
| LINK_TYPE            | The method to use for opening match links                                                                                                                             | No       | `app` (`app` or `http`)                                                                                              |
| LOG_LEVEL            | How much the server should log                                                                                                                                        | No       | `INFO` (supported options are `DEBUG`, `INFO`, `WARNING`, `ERROR`, and `CRITICAL`)                                   |
