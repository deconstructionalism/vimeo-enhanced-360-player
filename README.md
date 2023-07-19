# Vimeo Enhanced 360 Player

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/deconstructionalism/vimeo-no-code-video-player/blob/main/LICENSE)

Vimeo Enhanced 360 Player is a lightweight JavaScript library that allows you to embed Vimeo 360 videos into your
website without writing any code. This library allows for clean, unobstructed, interactive 360 videos.

## Features

- Embed Vimeo videos without writing any code
- Show responsive videos as full width on both mobile and desktop
- Allow background 360 videos to be interacted with via keyboard and mouse,
  functionality not available out of the box from the Vimeo SDK
- Handle mobile fallback videos to load on mobile only
  - this can be useful as mobile browsers do not currently support 360 videos
- Show a loading image while the video is loading
- Start 360 video with custom camera yaw, pitch, roll, and FOV
- Add a CSS class to body when a mobile browser is detected for easy styling
- Automatically append loading and play status as css classes both to the vimeo video root element and the
  body element for easy styling

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

## On Video Load or Play

This library will try and load all vimeo players on the page when the page loads in the order they appear
in the html.

When a video loads:

- the `body` element will get a `vimeo-enhanced-360-player--loaded-player-<index>` class
- the `vimeo-video-root` element at that index will get a `vimeo-video-root--loaded` class

When a video starts playing:

- the `body` element will get a `vimeo-enhanced-360-player--playing-player-<index>` class
- the `vimeo-video-root` element at that index will get a `vimeo-video-root--playing` class

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

### 360 Starting Camera Props

You can specify the starting camera position and rotation for 360 videos by passing a JSON string to the
`data-vimeo-starting-camera-props` attribute:

```html
<div
  class="vimeo-video-root"
  data-vimeo-id="123456789"
  data-vimeo-starting-camera-props='{"yaw": 180, "pitch": 0, "roll": 0, "fov": 45}'
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

You can build the code using the following command:

```bash
npm run build
```

## Contributing

Contributions to the Vimeo Enhanced 360 Player are welcome! If you have any bug reports, feature requests, or
suggestions, please open an issue on the [GitHub repository](https://github.com/deconstructionalism/vimeo-no-code-video-player/issues).

If you would like to contribute code, please fork the repository and create a pull request with your changes. Ensure
that your code adheres to the existing code style and is well-documented.
