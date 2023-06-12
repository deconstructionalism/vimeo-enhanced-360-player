# Vimeo Enhanced 360 Player

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/deconstructionalism/vimeo-no-code-video-player/blob/main/LICENSE)

Vimeo Enhanced 360 Player is a lightweight JavaScript library that allows you to embed Vimeo 360 videos into your website without writing any code. This library allows for clean, unobstructed, interactive 360 videos.

## Features

- Embed Vimeo videos without writing any code
- Show responsive videos as full width
- Allow background 360 videos to be interacted with via keyboard and mouse,
  functionality not available out of the box from the Vimeo SDK

## Installation

To use the Vimeo Enhanced 360 Player in your project, follow these steps:

1. Add a reference to the script in the `head` tag of your HTML file:

   ```html
   <script src="https://cdn.statically.io/gh/deconstructionalism/vimeo-enhanced-360-player/main/build/bundle.min.js"></script>
   ```

## Usage

Using the Vimeo Enhanced 360 Player is straightforward. Simply add a `div` element with the class `vimeo-video-player` and set the `data-vimeo-id` or `data-vimeo-url` attribute to the Vimeo video ID or URL, respectively.

```html
<div class="vimeo-video-player" data-vimeo-id="123456789"></div>
```

## Options

The Vimeo Enhanced 360 Player provides some optional attributes to further customize the player. Anyattribute described on See [here](https://developer.vimeo.com/player/sdk/embed) for additional attributes and usage information.
 can be included in the div element as an attribute with the format
`data-vimeo-<attribute-name>="<value>"`.

```html
<div class="vimeo-video-player" data-vimeo-id="123456789" data-vimeo-responsive="true"></div>
```

### Enhanced 360 Background Mode

Background mode is a available as a vimeo video attribute (`data-vimeo-background="true"`), which will conveniently remove the central
play and pause button. However, this mode does not allow you to interact with
the video at all.

By passing `data-vimeo-background-enhanced="true"` along with `data-vimeo-background="true"`,
you can navigate the 360 video using the keyboard or mouse.

```html
<div class="vimeo-video-player" data-vimeo-id="123456789" data-vimeo-background="true" data-vimeo-background-enhanced="true"></div>
```

## Development

You can run a hot-reload server to view a video player
configured in `index.html` by using the following command:

```bash
npm run start
```

## Contributing

Contributions to the Vimeo Enhanced 360 Player are welcome! If you have any bug reports, feature requests, or suggestions, please open an issue on the [GitHub repository](https://github.com/deconstructionalism/vimeo-no-code-video-player/issues).

If you would like to contribute code, please fork the repository and create a pull request with your changes. Ensure that your code adheres to the existing code style and is well-documented.
