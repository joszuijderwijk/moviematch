# MovieMatch

**This branch is not yet stable, please see the
[v1 branch](https://github.com/LukeChannings/moviematch/tree/v1) for the current
stable codebase**

[![Tests](https://github.com/LukeChannings/moviematch/workflows/Tests/badge.svg?branch=main)](https://github.com/LukeChannings/moviematch/actions/workflows/tests.yaml)
[![Docker Pulls](https://img.shields.io/docker/pulls/lukechannings/moviematch?label=Docker+Hub)](https://hub.docker.com/repository/docker/lukechannings/moviematch)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/lukechannings/moviematch?label=Latest+release)](https://github.com/LukeChannings/moviematch/releases)
[![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/lukechannings/moviematch?color=%23E74B4C&include_prereleases&label=Latest%20pre-release)](https://github.com/LukeChannings/moviematch/releases)

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
docker run -it -e PLEX_URL=https://plex.example.com -e PLEX_TOKEN=your-token -p 8000:8000 --pull always lukechannings/moviematch:latest
```

**From GitHub Container Registry (GHCR):**

```bash
docker run -it -e PLEX_URL=https://plex.example.com -e PLEX_TOKEN=your-token -p 8000:8000 --pull always ghcr.io/lukechannings/moviematch:latest
```

**With docker-compose:**

```bash
# Create .env file
cat > .env << EOF
PLEX_URL=https://plex.example.com
PLEX_TOKEN=your-plex-token
EOF

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

See [docker-compose documentation](./docs/docker-compose.markdown) for more
options.

### Option 2: Use Pre-built Binaries from GitHub Release

Download binaries from
[GitHub Releases](https://github.com/LukeChannings/moviematch/releases):

```bash
# Get the latest release
export VERSION=$(curl -s https://api.github.com/repos/LukeChannings/moviematch/releases/latest | grep tag_name | cut -d'"' -f4)

# Download binary for your architecture
wget https://github.com/LukeChannings/moviematch/releases/download/${VERSION}/linux-amd64.zip
unzip linux-amd64.zip

# Run it
export PLEX_URL="https://plex.example.com"
export PLEX_TOKEN="your-token"
./moviematch
```

### Option 3: Build from Source

For development or custom modifications:

```bash
# Prerequisites: Deno, Node.js, Just
# Install from: https://deno.land, https://nodejs.org, https://just.systems

# Clone and build
git clone https://github.com/LukeChannings/moviematch.git
cd moviematch

# Set your Plex credentials
export PLEX_URL="https://your-plex-server.com"
export PLEX_TOKEN="your-plex-token"

# Run the build script
chmod +x build.sh
./build.sh linux-amd64 /path/to/docker/folder
```

The script will build the UI, compile the binary, create a Docker image, and
start moviematch with docker-compose.

## Deployment

### Docker Compose (Recommended)

The easiest deployment method for servers:

```bash
git clone https://github.com/LukeChannings/moviematch.git
cd moviematch

# Configure with your Plex server
cp .env.example .env
nano .env  # Edit PLEX_URL and PLEX_TOKEN

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Image Sources

- **DockerHub**: `lukechannings/moviematch:latest` (mirror)
- **GHCR**: `ghcr.io/lukechannings/moviematch:latest` (primary)
- **Binaries**: Available on
  [GitHub Releases](https://github.com/LukeChannings/moviematch/releases)

All releases are built automatically via GitHub Actions when a version tag is
created.

## Creating a Release

To create and publish a new release:

1. **Update the version** in the [VERSION](./VERSION) file
2. **Update release notes** in
   [RELEASE_NOTES.markdown](./RELEASE_NOTES.markdown)
3. **Commit and tag:**
   ```bash
   git add VERSION RELEASE_NOTES.markdown
   git commit -m "release: version 2.0.0"
   git tag v2.0.0
   git push origin main v2.0.0
   ```

The release workflow will automatically:

- Run tests on multiple platforms (Linux, macOS, Windows)
- Build binaries for Linux (amd64, arm64)
- Create a GitHub Release with binaries
- Push Docker images to GHCR and DockerHub

## Configuration

⚠️ If you're using MovieMatch v1 please refer to
[**these options**](https://github.com/LukeChannings/moviematch/tree/v1#configuration).
⚠️

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

## FAQ

### Can a user get my Plex Token?

No. The client never talks directly to the Plex server and any requests that
need the token (e.g. querying movies, getting poster art) are made by the
server.

Only a subset of the Plex response is given to the client to minimise the chance
of sensitive information leaking out. All server logs have both `PLEX_URL` and
`PLEX_TOKEN` replaced with `****` to prevent accidental disclosure.

### Can it do TV shows too?

Yes, you can include a TV library in your `LIBRARY_TITLE_FILTER` list.

### Do you gather any data?

No. The server is entirely local to you and will work offline.

### Do you support languages other than English?

Yes. The server will use your browser's preferred language by default if it's
supported. Otherwise it'll fall back to English.

The translations can be found in [configs/localization](./configs/localization).

The file names follow [BCP47](https://tools.ietf.org/html/bcp47) naming. Feel
free to submit a Pull Request if you'd like your language to be supported.

### Can I run MovieMatch behind a reverse proxy?

Yes, you can read some documentation [here](./docs/reverse-proxy.markdown)

### MovieMatch crashes on startup with an error!

#### dns error: failed to lookup address information: Name or service not known

This is an issue with your DNS configuration, try using an IP address for Plex
instead of a domain name as a workaround. See
[#70](https://github.com/LukeChannings/moviematch/issues/70) for more details.

#### tcp connect error: Connection refused

MovieMatch can't connect to Plex due to your network configuration, see
[#51](https://github.com/LukeChannings/moviematch/issues/51) for ideas on how to
debug.
