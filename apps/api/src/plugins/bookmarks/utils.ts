import ogs from "open-graph-scraper";

interface GetOpenGraphDataParams {
  url: string;
}

interface GetSiteNameFallbackParams {
  url: string;
}

interface GetFaviconUrlFallbackParams {
  url: string;
}

interface OpenGraphData {
  description?: string;
  faviconUrl?: string;
  imageHeight?: number;
  imageWidth?: number;
  imageUrl?: string;
  siteName: string;
  title: string;
}

const twitterRegex =
  /(?:https?:\/\/)?(?:www\.)?\b(twitter\.com)\b((?:\/[a-z][a-z0-9_]*))?/i;
const applePodcastRegex =
  /(?:https?:\/\/)?\b(podcasts\.apple\.com)\b((?:\/[a-z][a-z0-9_]*))?/i;
const facebookRegex =
  /(?:https?:\/\/)?(?:www\.)?\b(m\.facebook|facebook|fb)\b\.(com|watch)\/?((?:\/[a-z][a-z0-9_]*))?/i;
const linkedinRegex =
  /(?:https?:\/\/)?(?:www\.)?\b(linkedin\.com)\b((?:\/[a-z][a-z0-9_]*))?/i;
// const spotifyRegex =
//   /https:\/\/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/;
// const validBookmarkTypes = ["spotify", "airbnb"] as const;
// type ValidBookmarkType = (typeof validBookmarkTypes)[number];

function getFaviconUrlFallback({
  url,
}: GetFaviconUrlFallbackParams): string | undefined {
  switch (true) {
    case applePodcastRegex.test(url):
      return "https://podcasts.apple.com/favicon.ico";
    case twitterRegex.test(url):
      return "https://abs.twimg.com/favicons/twitter.2.ico";
    default:
      return undefined;
  }
}

// returns a fallback site name if the og:site_name is not available
function getSiteNameFallback({
  url,
}: GetSiteNameFallbackParams): string | undefined {
  switch (true) {
    case facebookRegex.test(url):
      return "Facebook";
    case linkedinRegex.test(url):
      return "LinkedIn";
    default:
      return undefined;
  }
}

function extractDomain(url: string): string {
  const domain = url.replace("http://", "").replace("https://", "");
  return domain.split(/[/?#]/)[0];
}

export async function getOpenGraphData({
  url,
}: GetOpenGraphDataParams): Promise<OpenGraphData> {
  const trimmedUrl = url.trim();
  const isTwitter = twitterRegex.test(trimmedUrl);

  const { error, result } = await ogs({
    onlyGetOpenGraphInfo: true,
    url: trimmedUrl,
  });

  if (error) {
    throw Error("Could not load data");
  }

  let ogImage = result.ogImage;
  let imageUrl: string | undefined;
  if (typeof ogImage === "object") {
    imageUrl = Array.isArray(ogImage) ? ogImage[0]?.url : "";
  } else if (typeof ogImage === "string") {
    imageUrl = ogImage;
  }

  let siteName: string | undefined = result.ogSiteName;
  if (!siteName) {
    siteName = getSiteNameFallback({ url: trimmedUrl });
  }

  // twitter returns '//abs.twimg.com/favicons/twitter.2.ico' for favicon
  // isTwitter handles it
  let faviconUrl: string | undefined = result.favicon;
  if (!faviconUrl || isTwitter) {
    faviconUrl = getFaviconUrlFallback({ url: trimmedUrl });
  }

  // if faviconUrl doesn't start with http or https or //, construct the faviconUrl
  // e.g. faviconUrl = '/favicon.ico' -> faviconUrl = 'https://www.example.com/favicon.ico'
  if (faviconUrl && !/^((https?:\/\/)|(\/\/))/.test(faviconUrl)) {
    faviconUrl = `https://${extractDomain(trimmedUrl)}/${
      faviconUrl.indexOf("/") === 0 ? faviconUrl.slice(1) : faviconUrl
    }`;
  }

  return {
    description: result.ogDescription,
    faviconUrl,
    imageUrl,
    siteName: siteName || extractDomain(trimmedUrl),
    title: result.ogTitle || extractDomain(trimmedUrl),
    imageWidth: result.ogImage ? result.ogImage[0]?.width : undefined,
    imageHeight: result.ogImage ? result.ogImage[0]?.height : undefined,
  };
}
