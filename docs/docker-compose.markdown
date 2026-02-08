# Docker Compose

```yaml
version: "3"
services:
  moviematch:
    image: iovidius/moviematch:latest
    container_name: moviematch
    environment:
      PLEX_URL: "<Plex URL>"
      PLEX_TOKEN: "<Plex Token>"
    ports:
      - 8000:8000
```
