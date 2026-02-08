import React, { forwardRef, ReactNode, useState } from "react";
import type { Media } from "../../../../../types/moviematch";

import { InfoIcon } from "../icons/InfoIcon";
import { ContentRatingSymbol } from "../icons/ContentRatingSymbol";
import { StarIcon } from "../icons/StarIcon";
import { Pill } from "../atoms/Pill";
import { Tr } from "../atoms/Tr";

import styles from "./Card.module.css";
import { ShareIcon } from "../icons/ShareIcon";

export interface CardProps {
  title?: ReactNode;
  href?: string;
  media: Media;

  style?: React.CSSProperties;
}

const formatTime = (milliseconds: number) =>
  `${Math.round(milliseconds / 1000 / 60)} minutes`;

const formatRatingValue = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) {
    return null;
  }

  const formatted = value.toFixed(1);
  return formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted;
};

const getRatingSourceLabel = (ratingImage?: string, isAudience = false) => {
  if (!ratingImage) {
    return isAudience ? "Audience" : "Rating";
  }

  const normalized = ratingImage.toLowerCase();
  if (normalized.includes("imdb")) {
    return "IMDb";
  }
  if (normalized.includes("rottentomatoes")) {
    return isAudience ? "RT Audience" : "Rotten Tomatoes";
  }
  if (normalized.includes("themoviedb")) {
    return "TMDb";
  }
  if (normalized.includes("metacritic")) {
    return "Metacritic";
  }
  if (normalized.includes("trakt")) {
    return "Trakt";
  }

  return isAudience ? "Audience" : "Rating";
};

export const Card = forwardRef<HTMLDivElement & HTMLAnchorElement, CardProps>(
  ({ media, title, href }, ref) => {
    const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);

    const { rootPath } = document.body.dataset;

    const srcSet = [
      `${rootPath}${media.posterUrl}?width=300`,
      `${rootPath}${media.posterUrl}?width=450 1.5x`,
      `${rootPath}${media.posterUrl}?width=600 2x`,
      `${rootPath}${media.posterUrl}?width=900 3x`,
    ];

    const mediaTitle = `${media.title}${
      media.type === "movie" ? ` (${media.year})` : ""
    }`;

    const Tag = href ? "a" : "div";
    const externalRatingLabel = getRatingSourceLabel(media.ratingImage);
    const externalRatingValue = formatRatingValue(media.rating);
    const audienceRatingLabel = getRatingSourceLabel(
      media.audienceRatingImage,
      true,
    );
    const audienceRatingValue = formatRatingValue(media.audienceRating);
    const trailerQuery = `${media.title}${
      media.year ? ` ${media.year}` : ""
    } trailer`;
    const trailerUrl = `https://www.youtube.com/results?search_query=${
      encodeURIComponent(trailerQuery)
    }`;

    return (
      <Tag
        ref={ref}
        className={href ? styles.linkCard : styles.card}
        {...(href
          ? {
            href,
            target: /(iPhone|iPad)/.test(navigator.userAgent)
              ? "_self"
              : "_blank",
          }
          : {})}
      >
        <img
          className={styles.poster}
          src={srcSet[0]}
          srcSet={srcSet.join(", ")}
          alt={`${media.title} poster`}
        />
        {showMoreInfo
          ? (
            <div className={styles.moreInfo}>
              <p className={styles.moreInfoTitle}>{mediaTitle}</p>
              <div className={styles.moreInfoMetadata}>
                <Pill>{media.year}</Pill>
                <Pill>{formatTime(+media.duration)}</Pill>
                {media.ratingImage && externalRatingValue !== null && (
                  <Pill>
                    {externalRatingLabel} {externalRatingValue}
                  </Pill>
                )}
                {media.audienceRatingImage && audienceRatingValue !== null && (
                  <Pill>
                    {audienceRatingLabel} {audienceRatingValue}
                  </Pill>
                )}
                {media.contentRating && (
                  <Pill>
                    <ContentRatingSymbol
                      rating={media.contentRating}
                      size="1rem"
                    />
                  </Pill>
                )}
                {media.genres.map((genre) => <Pill key={genre}>{genre}</Pill>)}
                <Pill href={trailerUrl}>
                  <Tr name="TRAILER" /> <ShareIcon />
                </Pill>
                {!href && (
                  <Pill href={media.linkUrl}>
                    <span>Open in Plex</span>
                    <ShareIcon />
                  </Pill>
                )}
              </div>
              <p className={styles.moreInfoDescription}>
                {media.description}
              </p>
            </div>
          )
          : (
            <div className={styles.titleContainer}>
              <p className={styles.title}>{title ?? mediaTitle}</p>
            </div>
          )}
        <button
          className={styles.moreInfoButton}
          onClick={(e) => {
            e.preventDefault();
            setShowMoreInfo(!showMoreInfo);
          }}
        >
          <InfoIcon size="2rem" />
        </button>
      </Tag>
    );
  },
);

Card.displayName = "Card";
