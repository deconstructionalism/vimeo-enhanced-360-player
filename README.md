# Vimeo Enhanced 360 Player

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/deconstructionalism/vimeo-no-code-video-player/blob/main/LICENSE)

![CI Passing](https://github.com/deconstructionalism/vimeo-enhanced-360-player/actions/workflows/ci.yml/badge.svg)

https://github.com/deconstructionalism/vimeo-enhanced-360-player/actions/workflows/ci.yml/badge.svgwebsite without writing any code. This library allows for clean, unobstructed, interactive 360 videos.

## Features

- Embed Vimeo videos without writing any code
- Show responsive videos as full width on both mobile and desktop
- Allow background 360 videos to be interacted with via keyboard and mouse,
  functionality not available out of the box from the Vimeo SDK
- Handle mobile fallback videos to load on mobile only
  - this can be useful as mobile browsers do not currently support 360 videos
- Show a loading image while the video is loading
- Add a CSS class to body when a mobile browser is detected for easy styling
- Emit custom events from players that can be listened to via JavaScript
- Vimeo player instances can be accessed via a global variable

## Installation

To use the Vimeo Enhanced 360 Player in your project, follow these steps:

1. Add a reference to the script in the `head` tag of your HTML file:

   ```html
   <script src="https://cdn.statically.io/gh/deconstructionalism/vimeo-enhanced-360-player/main/build/bundle.min.js"></script>
   ```

## Usage

Using the Vimeo Enhanced 360 Player is straightforward. Simply add a `div` element with the class `vimeo-video-root`
and set the `data-vimeo-id` or `data-vimeo-url` attribute to the Vimeo video ID or URL, respectively.

```html
<div class="vimeo-video-root" data-vimeo-id="123456789"></div>
```

## Mobile Browser Detection

This library will detect if the user is on a mobile browser and will append a
`vimeo-enhanced-360-player--mobile-browser` class to the `body` element if so.

## Player Events

When any [player events](https://developer.vimeo.com/player/sdk/reference) occur,
this library will emit a custom event that will bubble up through the DOM.

The custom event name will be `vimeo-enhanced-360-player-<event-name>`, where
`<event-name>` is the name of the player event documented in the link above.

For example, this autoplay video will emit a `vimeo-enhanced-360-player-playing` event
when it starts playing, which can then be caught in a parent element such as `document`:

```html
<div
  class="vimeo-video-root"
  data-vimeo-id="123456789"
  data-vimeo-autoplay="true"
></div>

<script>
  document.addEventListener('vimeo-enhanced-360-player-playing', () => {
    alert('The video is playing!')
  })
</script>
```

## Player Instances

This library will store the Vimeo player instances in a global array,
`window.vimeoPlayers`, in case you wish to manipulate the players directly
using Javascript.

## Options

The Vimeo Enhanced 360 Player provides some optional attributes to further customize the player. Any attribute described
[here](https://developer.vimeo.com/player/sdk/embed) can be included in the div element as an attribute with the format:
`data-vimeo-<attribute-name>="<value>"`.

```html
<div
  class="vimeo-video-root"
  data-vimeo-id="123456789"
  data-vimeo-responsive="true"
></div>
```

## Custom Options

This library also provides some custom attributes beyond what is provided by the Vimeo SDK to further customize the
player for 360 videos.

### Background Loading Image

You can specify an image to show in the background (including an animated GIF) while the video is loading by passing a
image url to the `data-vimeo-loading-image-url` attribute:

```html
<div
  class="vimeo-video-root"
  data-vimeo-id="123456789"
  data-vimeo-loading-image-url="https://example.com/loading.gif"
></div>
```

### Mobile Fallback Video

Most mobile browsers do not currently support rendering 360 Vimeo videos. To provide a fallback video for mobile users,
you can pass a Vimeo video ID or URL to the `data-vimeo-mobile-fallback-id` or `data-vimeo-mobile-fallback-url`
attribute:

```html
<div
  class="vimeo-video-root"
  data-vimeo-id="123456789"
  data-vimeo-mobile-fallback-id="987654321"
></div>
```

### Enhanced 360 Background Mode

Background mode is a available as a vimeo video attribute (`data-vimeo-background="true"`), which will conveniently
remove the central play and pause button. However, this mode does not allow you to interact with the video at all.

By passing `data-vimeo-background-enhanced="true"` along with `data-vimeo-background="true"`, you can navigate the 360
video using mouse via click and drag:

```html
<div
  class="vimeo-video-root"
  data-vimeo-id="123456789"
  data-vimeo-background="true"
  data-vimeo-background-enhanced="true"
></div>
```

## Development

You can run a hot-reload server to view a video player configured in `index.html` by using the following command:

```bash
npm run start
```

You can lint the code using the following command:

```bash
npm run lint
```

You can format the code using the following command:

```bash
npm run format
```

You can test the code using the following command:

```bash
npm run test
```

You can build the code using the following command:

```bash
npm run build
```

## Contributing

Contributions to the Vimeo Enhanced 360 Player are welcome! If you have any bug reports, feature requests, or
suggestions, please open an issue on the [GitHub repository](https://github.com/deconstructionalism/vimeo-no-code-video-player/issues).

If you would like to contribute code, please fork the repository and create a pull request with your changes. Ensure
that your code adheres to the existing code style and is well-documented.
