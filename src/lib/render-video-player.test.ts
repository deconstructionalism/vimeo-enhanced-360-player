import { isStyleInStyleSheets } from "../test-utils/document-utils";
import { createPlayerAndElement } from "../test-utils/player-utils";
import { mobileBrowserUserAgents } from "./document-helpers";
import renderVideoPlayer, {
  generateFullWidthStyleCss,
} from "./render-video-player";
import VimeoCameraInputTracker from "./vimeo-camera-input-tracker";
import * as vimeoVideoPlayerHelpers from "./vimeo-video-player-helpers";

// MOCKS

jest.mock("./vimeo-camera-input-tracker");

// CONSTANTS

const VIMEO_ID = "12345";
const VIMEO_MOBILE_FALLBACK_URL = "https://vimeo.com/5678";
const VIMEO_MOBILE_FALLBACK_ID = "5678";
const VIMEO_LOADING_IMAGE_URL = "https://example.com/image.png";

// TESTS

describe("renderVideoPlayer", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("does not use mobile fallback video id if provided in desktop browser", async () => {
    // Create player and element using `renderVideoPlayer` with mobile fallback url
    // and id
    const { player } = await createPlayerAndElement(
      {
        vimeoId: VIMEO_ID,
        vimeoMobileFallbackId: VIMEO_MOBILE_FALLBACK_ID,
        vimeoMobileFallbackUrl: VIMEO_MOBILE_FALLBACK_URL,
      },
      true
    );

    expect(player.loadVideo).not.toHaveBeenCalledWith();
  });

  it("uses mobile fallback video id if provided in mobile browser", async () => {
    // Mock userAgent to be mobile
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(mobileBrowserUserAgents[0]);

    // Create player and element using `renderVideoPlayer` with mobile fallback url
    const { player } = await createPlayerAndElement(
      {
        vimeoId: VIMEO_ID,
        vimeoMobileFallbackId: VIMEO_MOBILE_FALLBACK_ID,
      },
      true
    );

    expect(player.loadVideo).toHaveBeenCalledWith(VIMEO_MOBILE_FALLBACK_ID);
  });

  it("uses mobile fallback video url if provided in mobile browser", async () => {
    // Mock userAgent to be mobile
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(mobileBrowserUserAgents[0]);

    // Create player and element using `renderVideoPlayer` with mobile fallback url
    const { player } = await createPlayerAndElement(
      {
        vimeoId: VIMEO_ID,
        vimeoMobileFallbackUrl: VIMEO_MOBILE_FALLBACK_URL,
      },
      true
    );

    expect(player.loadVideo).toHaveBeenCalledWith(VIMEO_MOBILE_FALLBACK_URL);
  });

  it("does not use camera input tracker if video is 360 but not background enhanced video", async () => {
    // Create player and element using `renderVideoPlayer`
    await createPlayerAndElement({ vimeoId: VIMEO_ID }, true);

    expect(VimeoCameraInputTracker).not.toHaveBeenCalled();
  });

  it("does not use camera input tracker if video is not 360", async () => {
    // Mock checkIf360Video to return false
    jest
      .spyOn(vimeoVideoPlayerHelpers, "checkIf360Video")
      .mockResolvedValue(false);

    // Create player and element using `renderVideoPlayer`
    await createPlayerAndElement({ vimeoId: VIMEO_ID }, true);

    expect(VimeoCameraInputTracker).not.toHaveBeenCalled();
  });

  it("uses camera input tracker if video is 360 and is a background enhanced video", async () => {
    // Create player and element using `renderVideoPlayer` that is in
    // enhanced background mode
    await createPlayerAndElement(
      {
        vimeoId: VIMEO_ID,
        vimeoBackground: "true",
        vimeoBackgroundEnhanced: "true",
      },
      true
    );

    expect(VimeoCameraInputTracker).toHaveBeenCalled();
  });

  it("does not add full-width styles to non-responsive videos", async () => {
    // Create player and element using `renderVideoPlayer`
    const { player } = await createPlayerAndElement(
      { vimeoId: VIMEO_ID },
      true
    );

    expect(player.getVideoWidth).not.toHaveBeenCalled();
    expect(player.getVideoHeight).not.toHaveBeenCalled();

    // Get the height and width of the video
    const height = await player.getVideoHeight();
    const width = await player.getVideoWidth();

    expect(height).toBeGreaterThan(0);
    expect(width).toBeGreaterThan(0);

    // Generate the expected style for a responsive video
    const style = generateFullWidthStyleCss(height, width);

    expect(isStyleInStyleSheets(style, document)).toBe(false);
  });

  it("adds full-width styles to responsive videos", async () => {
    // Create player and element using `renderVideoPlayer`
    const { player } = await createPlayerAndElement(
      { vimeoId: VIMEO_ID, vimeoResponsive: "true" },
      true
    );

    expect(player.getVideoWidth).toHaveBeenCalledTimes(1);
    expect(player.getVideoHeight).toHaveBeenCalledTimes(1);

    // Get the height and width of the video
    const height = await player.getVideoHeight();
    const width = await player.getVideoWidth();

    expect(height).toBeGreaterThan(0);
    expect(width).toBeGreaterThan(0);

    // Generate the expected style for a responsive video
    const style = generateFullWidthStyleCss(height, width);

    expect(isStyleInStyleSheets(style, document)).toBe(true);
  });

  it("adds event emitters to player", async () => {
    // Spy on `addEventEmitters`
    const eventEmittersSpy = jest.spyOn(
      vimeoVideoPlayerHelpers,
      "addEventEmitters"
    );

    // Create player and element using `renderVideoPlayer`
    const { player, element } = await createPlayerAndElement(
      { vimeoId: VIMEO_ID },
      true
    );

    expect(eventEmittersSpy).toHaveBeenCalledTimes(1);
    expect(eventEmittersSpy).toHaveBeenLastCalledWith(player, element);
  });

  it("adds loading image and mutes and autoplays if it's an autoplay video", async () => {
    // Spy on `addLoadingImage`
    const addLoadingImageSpy = jest.spyOn(
      vimeoVideoPlayerHelpers,
      "addLoadingImage"
    );

    // Create player and element using `renderVideoPlayer`
    const { player, element } = await createPlayerAndElement(
      {
        vimeoId: VIMEO_ID,
        vimeoAutoplay: "true",
        vimeoLoadingImageUrl: VIMEO_LOADING_IMAGE_URL,
      },
      true
    );

    const expectedStyle =
      vimeoVideoPlayerHelpers.generateLoadingImageStyleCSS(element);

    expect(addLoadingImageSpy).toHaveBeenCalledTimes(1);
    expect(addLoadingImageSpy).toHaveBeenCalledWith(player, element, true);
    expect(isStyleInStyleSheets(expectedStyle, document)).toBe(true);
    expect(player.setVolume).toHaveBeenCalledTimes(1);
    expect(player.setVolume).toHaveBeenCalledWith(0);
    expect(player.getVideoId).toHaveBeenCalledTimes(1);

    // Get the video id
    const videoId = await player.getVideoId();

    expect(player.loadVideo).toHaveBeenCalledTimes(1);
    expect(player.loadVideo).toHaveBeenCalledWith(videoId);
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  it("adds loading image and mutes and autoplays if it's a background video", async () => {
    // Spy on `addLoadingImage`
    const addLoadingImageSpy = jest.spyOn(
      vimeoVideoPlayerHelpers,
      "addLoadingImage"
    );

    // Create player and element using `renderVideoPlayer`
    const { player, element } = await createPlayerAndElement(
      {
        vimeoId: VIMEO_ID,
        vimeoBackground: "true",
        vimeoLoadingImageUrl: VIMEO_LOADING_IMAGE_URL,
      },
      true
    );

    const expectedStyle =
      vimeoVideoPlayerHelpers.generateLoadingImageStyleCSS(element);

    expect(addLoadingImageSpy).toHaveBeenCalledTimes(1);
    expect(addLoadingImageSpy).toHaveBeenCalledWith(player, element, true);
    expect(isStyleInStyleSheets(expectedStyle, document)).toBe(true);
    expect(player.setVolume).toHaveBeenCalledTimes(1);
    expect(player.setVolume).toHaveBeenCalledWith(0);
    expect(player.getVideoId).toHaveBeenCalledTimes(1);

    // Get the video id
    const videoId = await player.getVideoId();

    expect(player.loadVideo).toHaveBeenCalledTimes(1);
    expect(player.loadVideo).toHaveBeenCalledWith(videoId);
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  it("adds loading image and auto-plays if it's a background enhanced video", async () => {
    // Spy on `addLoadingImage`
    const addLoadingImageSpy = jest.spyOn(
      vimeoVideoPlayerHelpers,
      "addLoadingImage"
    );

    // Create player and element using `renderVideoPlayer`
    const { player, element } = await createPlayerAndElement(
      {
        vimeoId: VIMEO_ID,
        vimeoBackground: "true",
        vimeoBackgroundEnhanced: "true",
        vimeoLoadingImageUrl: VIMEO_LOADING_IMAGE_URL,
      },
      true
    );

    const expectedStyle =
      vimeoVideoPlayerHelpers.generateLoadingImageStyleCSS(element);

    expect(addLoadingImageSpy).toHaveBeenCalledTimes(1);
    expect(addLoadingImageSpy).toHaveBeenCalledWith(player, element, true);
    expect(isStyleInStyleSheets(expectedStyle, document)).toBe(true);
    expect(player.setVolume).toHaveBeenCalledTimes(1);
    expect(player.setVolume).toHaveBeenCalledWith(0);
    expect(player.getVideoId).toHaveBeenCalledTimes(1);

    // Get the video id
    const videoId = await player.getVideoId();

    expect(player.loadVideo).toHaveBeenCalledTimes(1);
    expect(player.loadVideo).toHaveBeenCalledWith(videoId);
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  it("adds loading image if it is not background or auto-play video", async () => {
    // Spy on `addLoadingImage`
    const addLoadingImageSpy = jest.spyOn(
      vimeoVideoPlayerHelpers,
      "addLoadingImage"
    );

    // Create player and element using `renderVideoPlayer`
    const { player, element } = await createPlayerAndElement(
      {
        vimeoId: VIMEO_ID,
        vimeoLoadingImageUrl: VIMEO_LOADING_IMAGE_URL,
      },
      true
    );

    const expectedStyle =
      vimeoVideoPlayerHelpers.generateLoadingImageStyleCSS(element);

    expect(addLoadingImageSpy).toHaveBeenCalledTimes(1);
    expect(addLoadingImageSpy).toHaveBeenCalledWith(player, element, false);
    expect(isStyleInStyleSheets(expectedStyle, document)).toBe(true);
    expect(player.setVolume).not.toHaveBeenCalled();
    expect(player.getVideoId).not.toHaveBeenCalled();
    expect(player.loadVideo).not.toHaveBeenCalled();
    expect(player.play).not.toHaveBeenCalled();
  });

  it("returns a player instance", async () => {
    const player = await renderVideoPlayer(document.createElement("div"));

    expect(player).toBeDefined();
  });
});
