import {
  Filter,
  Filters,
  Library,
  LibraryType,
  Media,
} from "/types/moviematch.ts";
import { PlexApi, PlexDeepLinkOptions } from "/internal/app/plex/api.ts";
import {
  MovieMatchProvider,
} from "/internal/app/moviematch/providers/types.ts";
import { FieldType } from "/internal/app/plex/types/library_items.ts";
import { filterToQueryString } from "/internal/app/plex/util.ts";

export interface PlexProviderConfig {
  url: string;
  token: string;
  libraryTitleFilter?: string[];
  libraryTypeFilter?: LibraryType[];
  linkType?: "app" | "webLocal" | "webExternal";
}

export const filtersToPlexQueryString = (
  filters?: Filter[],
): Record<string, string> => {
  const queryString: Record<string, string> = {};

  if (filters) {
    for (const filter of filters) {
      // We're re-using the filters dict to include library,
      // but we want to handle that ourselves.
      if (filter.key === "library") {
        continue;
      }

      const [key, value] = filterToQueryString(filter);
      queryString[key] = value;
    }
  }

  return queryString;
};

export const createProvider = (
  id: string,
  providerOptions: PlexProviderConfig,
): MovieMatchProvider => {
  const api = new PlexApi(
    providerOptions.url,
    providerOptions.token,
    providerOptions,
  );

  let libraries: Library[];

  const getLibraries = async () => {
    if (libraries) {
      return libraries;
    }

    const plexLibraries = await api.getLibraries();

    libraries = plexLibraries
      .map((library) =>
        ({
          title: library.title,
          key: library.key,
          type: library.type,
        }) as Library
      )
      .filter((library) =>
        (providerOptions.libraryTypeFilter ?? ["movie"]).includes(library.type)
      );

    return libraries;
  };

  return {
    options: providerOptions,
    isAvailable: () => api.isAvaliable(),
    isUserAuthorized: () => Promise.resolve(true),
    getName: () => api.getServerName(),
    getLibraries,
    getFilters: async () => {
      const meta = await api.getAllFilters();
      const availableTypes: LibraryType[] = ["movie", "show"];

      const filters = new Map<string, {
        title: string;
        key: string;
        type: string;
        libraryTypes: LibraryType[];
      }>();

      for (const type of meta.Type) {
        if (availableTypes.includes(type.type as LibraryType) && type.Filter) {
          for (const filter of type.Filter) {
            if (filters.has(filter.filter)) {
              const existing = filters.get(filter.filter);
              if (existing) {
                existing.libraryTypes.push(type.type as LibraryType);
              }
            } else {
              const filterType = type.Field!.find((_) =>
                _.key === filter.filter
              )?.type ?? filter.filterType;
              filters.set(filter.filter, {
                title: filter.title,
                key: filter.filter,
                type: filterType!,
                libraryTypes: [type.type as LibraryType],
              });
            }
          }
        }
      }

      // Check if rating field exists in Field metadata and add it if not present
      for (const type of meta.Type) {
        if (availableTypes.includes(type.type as LibraryType) && type.Field) {
          for (const field of type.Field) {
            // Add rating field if it exists in Field metadata but not in filters
            if (field.key === "rating" && !filters.has(field.key)) {
              filters.set(field.key, {
                title: "Rating (0-10)",
                key: field.key,
                type: field.type,
                libraryTypes: [type.type as LibraryType],
              });
            }
          }
        }
      }

      // Fallback: Ensure rating filter is available even if not in Plex metadata
      if (!filters.has("rating")) {
        filters.set("rating", {
          title: "Rating (0-10)",
          key: "rating",
          type: "integer",
          libraryTypes: ["movie", "show"],
        });
      }

      const filterTypes = meta.FieldType.reduce(
        (acc, _: FieldType) => ({
          ...acc,
          [_.type]: _.Operator,
        }),
        {} as Filters["filterTypes"],
      );

      return {
        filters: [...filters.values()],
        filterTypes,
      };
    },
    getFilterValues: async (key: string) => {
      const filterValues = await api.getFilterValues(key);

      if (filterValues.size) {
        const deduplicatedFilterValues = new Map<string, string>();

        for (const filterValue of filterValues.Directory) {
          deduplicatedFilterValues.set(filterValue.key, filterValue.title);
        }

        return [...deduplicatedFilterValues.entries()].map((
          [value, title],
        ) => ({
          value,
          title,
        }));
      }

      return [];
    },
    getArtwork: (
      key: string,
      width: number,
    ): Promise<[ReadableStream<Uint8Array>, Headers]> =>
      api.transcodePhoto(key, { width }),
    getCanonicalUrl: (key: string, options) => {
      let linkType: PlexDeepLinkOptions["type"];

      switch (providerOptions.linkType) {
        case "app":
          linkType = "app";
          break;
        case "webExternal":
          linkType = "plexTv";
          break;
        case "webLocal":
          linkType = "plexLocal";
          break;
        default: {
          if (options?.userAgent?.includes("iPhone")) {
            linkType = "app";
          } else {
            linkType = "plexTv";
          }
        }
      }

      return api.getDeepLink(key, { type: linkType });
    },
    getMedia: async ({ filters }) => {
      // Separate rating filters from Plex-supported filters
      const ratingFilters = filters?.filter(f => 
        f.key === "rating"
      ) ?? [];
      
      const plexFilters = filters?.filter(f => 
        f.key !== "rating"
      );

      const filterParams: Record<string, string> = filtersToPlexQueryString(
        plexFilters,
      );

      const libraries: Library[] = await getLibraries();

      const media: Media[] = [];
      for (const library of libraries) {
        const libraryItems = await api.getLibraryItems(
          library.key,
          { filters: filterParams },
        );
        if (libraryItems.size) {
          for (const libraryItem of libraryItems.Metadata) {
            let posterUrl;
            if (libraryItem.thumb) {
              const [, , , metadataId, , thumbId] = libraryItem.thumb.split(
                "/",
              );
              posterUrl = `/api/poster/${id}/${metadataId}/${thumbId}`;
            }
            
            const mediaItem: Media = {
              id: libraryItem.guid,
              type: libraryItem.type as LibraryType,
              title: libraryItem.title,
              description: libraryItem.summary,
              tagline: libraryItem.tagline,
              year: libraryItem.year,
              posterUrl,
              linkUrl: `/api/link/${id}/${libraryItem.key}`,
              genres: libraryItem.Genre?.map((_) => _.tag) ?? [],
              duration: Number(libraryItem.duration) || 0,
              rating: libraryItem.rating ? Number(libraryItem.rating) : undefined,
              ratingImage: libraryItem.ratingImage,
              audienceRating: libraryItem.audienceRating
                ? Number(libraryItem.audienceRating)
                : undefined,
              audienceRatingImage: libraryItem.audienceRatingImage,
              contentRating: libraryItem.contentRating,
            };
            
            // Apply client-side rating filters
            let includeItem = true;
            for (const filter of ratingFilters) {
              const filterValue = Number(filter.value[0]);
              // IMDb scores come through as audienceRating
              const itemValue = mediaItem.audienceRating || mediaItem.rating || 0;
              
              switch (filter.operator) {
                case "=":
                case "==":
                  if (itemValue !== filterValue) includeItem = false;
                  break;
                case "!=":
                case "!==":
                  if (itemValue === filterValue) includeItem = false;
                  break;
                case ">>=":
                case ">=":
                  if (itemValue < filterValue) includeItem = false;
                  break;
                case "<<=":
                case "<=":
                  if (itemValue > filterValue) includeItem = false;
                  break;
                default:
                  break;
              }
              
              if (!includeItem) {
                break;
              }
            }
            
            if (includeItem) {
              media.push(mediaItem);
            }
          }
        }
      }

      return media;
    },
  };
};
